import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Ajv from 'ajv';

import { ToxiProxy } from './utils/toxiproxy.js';
import importAllRoutes from './utils/routes.js';
import config from './config.js';
import logger from './logger.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());

export async function server() {

  const proxy = new ToxiProxy();

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    proxy.stop();
    process.exit();
  });

  const ajv = new Ajv({ allErrors: true, strict: false });
  app.set('ajv', ajv);

  const routes = await importAllRoutes();

  routes.forEach(module => {
    const routes = module.default;
    if (Array.isArray(routes)) routes.forEach(({ callback, route, method, schema }) => {
      if (schema) ajv.addSchema(schema);
      app[method](route, (req, res, next) => {
        if (schema) {
          const validate = ajv.getSchema(schema.$id);
          if (!validate(req.body)) return res.status(400).json({ errors: validate.errors });
        }
        try {
          callback.call({ app, proxy, ajv }, req, res, next);
        } catch (error) {
          logger.error(`Error in route ${route}: ${error.message}`);
          res.status(500).json({ error: 'Internal server error' });
        }
      })
    });
  });

  app.use(express.static('public'));

  const server = await app.listen(config.port);

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.on('listening', async () => {
      logger.info(`Toxiproxy wrapper API server running on port ${config.port}`);
      logger.info(`Toxiproxy server address: ${proxy.hostname}`);
      await proxy.start();
      proxy.sync();
    });
  })
}
