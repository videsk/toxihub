import axios from 'axios';
import logger from '../logger.js';
import { createProxySchema } from './schemas/proxies.js';

/**
 * Get all proxies
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getProxies(req, res) {
  try {
    await this.proxy.sync();
    res.json(this.proxy.proxies);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new proxy
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function createProxy(req, res) {
  const { name, listen, upstream } = req.body;

  try {
    const response = await axios.post(`${this.proxy.hostname}/proxies`, {
      name,
      listen,
      upstream,
      enabled: true
    });

    await this.proxy.sync();
    res.status(201).json(response.data);
  } catch (error) {
    logger.error(error.message);
    if (error.message.includes(this.proxy.options.toxiproxyPort)) {
      res.status(503).json({ message: 'Toxiproxy is down, trying to restart' });
      return this.proxy.restart();
    }
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(502).json({ error: error.message });
  }
}

/**
 * Get a specific proxy
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getProxy(req, res) {
  const { name } = req.params;

  try {
    const response = await axios.get(`${this.proxy.hostname}/proxies/${name}`);
    res.json(response.data);
  } catch (error) {
    logger.error(error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

/**
 * Toggle a proxy
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function toggleProxy(req, res) {
  const { name } = req.params;

  try {
    const proxyResponse = await axios.get(`${this.proxy.hostname}/proxies/${name}`);
    const proxy = proxyResponse.data;

    const enabled = !proxy.enabled;

    const updateResponse = await axios.post(`${this.proxy.hostname}/proxies/${name}`, {
      ...proxy,
      enabled
    });

    await this.proxy.sync();
    res.json(updateResponse.data);
  } catch (error) {
    logger.error(error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a proxy
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteProxy(req, res) {
  const { name } = req.params;

  try {
    await axios.delete(`${this.proxy.hostname}/proxies/${name}`);
    await this.proxy.sync();
    res.status(204).end();
  } catch (error) {
    logger.error(error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

export default [
  {
    callback: getProxies,
    route: '/proxies',
    method: 'get',
  },
  {
    callback: createProxy,
    route: '/proxies',
    method: 'post',
    schema: createProxySchema,
  },
  {
    callback: getProxy,
    route: '/proxies/:name',
    method: 'get',
  },
  {
    callback: toggleProxy,
    route: '/proxies/:name/toggle',
    method: 'patch',
  },
  {
    callback: deleteProxy,
    route: '/proxies/:name',
    method: 'delete',
  }
]