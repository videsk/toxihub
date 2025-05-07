import EventEmitter from 'node:events';
import { spawn, execSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import axios from 'axios';
import logger from '../logger.js';
import config from '../config.js';

export class ToxiProxy extends EventEmitter {

  #process;
  #isRunning = false;
  #proxies = [];
  #options = ToxiProxy.defaults;

  constructor(options = {}) {
    super();
    this.#options = { ...ToxiProxy.defaults, ...options };
  }

  get options() {
    return this.#options;
  }

  get process() {
    return this.#process;
  }

  get proxies() {
    return this.#proxies;
  }

  get hostname() {
    return this.options.hostname;
  }

  get isRunning() {
    if (this.#isRunning) return true;
    const { hostname } = this.options;
    return new Promise(async resolve => {
      const response = await axios.get(`${hostname}/version`).catch(e => e);
      this.#isRunning = !(response instanceof Error);
      resolve(this.#isRunning);
      if (response instanceof Error) logger.warn('Toxiproxy server is not running');
      else logger.info(`Toxiproxy server is running (version: ${JSON.stringify(response.data)})`);
    });
  }

  async start() {
    if (await this.isRunning) return;

    if (!this.options.autoStartServer) return logger.error('Toxiproxy server is not running and auto-start is disabled');
    logger.info('Starting toxiproxy server...');

    this.#process = await spawn(config.toxiproxyServer, ['-host', config.toxiproxyHost, '-port', config.toxiproxyPort]);

    this.#process.stdout.on('data', data => {
      logger.debug(`Toxiproxy server stdout: ${data}`);
      this.emit('data', data);
    });

    this.#process.stderr.on('data', data => {
      logger.debug(`Toxiproxy server stderr: ${data}`);
      this.emit('error', data);
    });

    this.#process.on('close', code => {
      logger.info(`Toxiproxy server process exited with code ${code}`);
      this.#isRunning = false;
      this.#process = null;
      this.emit('closed', code);
    });

    let attempts = 0;
    while (attempts < 10) {
      await setTimeout(500);
      if (await this.isRunning) return;
      attempts++;
    }

    logger.error('Failed to start toxiproxy server');
  }

  stop() {
    if (!this.#process) return false;
    logger.info('Stopping toxiproxy server...');
    this.#process.kill();
    this.#process = null;
    this.#isRunning = false;
    return true;
  }

  restart() {
    logger.info('Toxiproxy server is resetting');
    this.#isRunning = false;
    this.#process?.kill();
    this.#process = null;
    return this.start();
  }

  async sync() {
    if (!this.#isRunning) return false;
    try {
      const response = await axios.get(`${this.options.hostname}/proxies`);
      this.#proxies = response.data;
      logger.debug('State synchronized with toxiproxy server');
      return true;
    } catch (error) {
      logger.error(`Error synchronizing state: ${error.message}`);
      return false;
    }
  }

  execute(args) {
    const { toxiproxyCli } = this.options;
    try {
      const command = `${toxiproxyCli} ${args.join(' ')}`;
      logger.debug(`Executing: ${command}`);
      const output = execSync(command, { encoding: 'utf8' });
      logger.debug(`Command output: ${output}`);
      return { success: true, output };
    } catch (error) {
      logger.error(`Command execution error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async expressMiddleware(req, res, next) {
    if (!this.#isRunning && !(await this.start())) return res
      .status(503)
      .json({ error: 'Toxiproxy server is not running', autoStartServer: this.options.toxiproxyServer });
    next();
  }

  static get defaults() {
    return {
      hostname: `http://${config.toxiproxyHost}:${config.toxiproxyPort}`,
      ...config,
    }
  }

}