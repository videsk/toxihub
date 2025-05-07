import axios from 'axios';
import config from '../config.js';

/**
 * Check the status of the toxiproxy server
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function status(req, res) {
  const serverRunning = await this.proxy.isRunning;
  res.json({
    status: serverRunning ? 'running' : 'stopped',
    autoStart: config.autoStartServer,
    toxiproxyHost: config.toxiproxyHost,
    toxiproxyPort: config.toxiproxyPort
  });
}

/**
 * Start the toxiproxy server
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function start(req, res) {
  if (this.proxy.isRunning) return res.json({ status: 'already_running' });

  const success = await this.proxy.start();
  if (!success) return res.status(500).json({ error: 'Failed to start toxiproxy server' });
  await this.proxy.sync();
  res.json({ status: 'started' });
}

/**
 * Stop the toxiproxy server
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function stop(req, res) {
  if (!await this.proxy.isRunning) return res.json({ status: 'already_stopped' });

  const success = this.proxy.stop();
  if (success) res.json({ status: 'stopped' });
  else res.status(400).json({ error: 'Cannot stop server that was not started by this wrapper' });
}

/**
 * Reset the toxiproxy server
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function reset(req, res) {
  try {
    await axios.post(`${this.proxy.hostname}/reset`);
    await this.proxy.sync();
    res.status(204).send();
  } catch (error) {
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

export default [
  {
    callback: status,
    route: '/status',
    method: 'get',
  },
  {
    callback: start,
    route: '/status',
    method: 'post'
  },
  {
    callback: stop,
    route: '/status',
    method: 'delete'
  },
  {
    callback: reset,
    route: '/status',
    method: 'put'
  }
];