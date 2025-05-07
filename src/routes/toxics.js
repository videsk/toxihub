import axios from 'axios';
import createToxicSchema from './schemas/toxic.js';
import logger from '../logger.js';

/**
 * Get all toxics for a proxy
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getToxics(req, res) {
  const { name } = req.params;

  try {
    const response = await axios.get(`${this.proxy.hostname}/proxies/${name}/toxics`);
    res.json(response.data);
  } catch (error) {
    logger.error(error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new toxic
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function createToxic(req, res) {
  const { name } = req.params;
  const {
    type,
    name: toxicName,
    stream = 'downstream',
    toxicity = 1.0,
    attributes = {}
  } = req.body;

  try {
    const toxicData = {
      type,
      name: toxicName || `${type}_${stream}`,
      stream,
      toxicity,
      attributes
    };

    const response = await axios.post(`${this.proxy.hostname}/proxies/${name}/toxics`, toxicData);

    await this.proxy.sync();
    res.status(201).json(response.data);
  } catch (error) {
    logger.error(error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

/**
 * Update an existing toxic
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function updateToxic(req, res) {
  const { name, toxicName } = req.params;
  const { toxicity, attributes = {} } = req.body;

  try {
    const updateData = {
      ...(toxicity !== undefined && { toxicity }),
      attributes
    };

    const response = await axios.post(`${this.proxy.hostname}/proxies/${name}/toxics/${toxicName}`, updateData);

    await this.proxy.sync();
    res.json(response.data);
  } catch (error) {
    logger.error(error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a toxic
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteToxic(req, res) {
  const { name, toxicName } = req.params;

  try {
    await axios.delete(`${this.proxy.hostname}/proxies/${name}/toxics/${toxicName}`);
    await this.proxy.sync();
    res.status(204).send();
  } catch (error) {
    logger.error(error.message);
    if (error.response) res.status(error.response.status).json(error.response.data);
    else res.status(500).json({ error: error.message });
  }
}

export default [
  {
    callback: getToxics,
    route: '/proxies/:name/toxics',
    method: 'get'
  },
  {
    callback: createToxic,
    route: '/proxies/:name/toxics',
    method: 'post',
    schema: createToxicSchema
  },
  {
    callback: updateToxic,
    route: '/proxies/:name/toxics/:toxicName',
    method: 'post'
  },
  {
    callback: deleteToxic,
    route: '/proxies/:name/toxics/:toxicName',
    method: 'delete'
  }
]