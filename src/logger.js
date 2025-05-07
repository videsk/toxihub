import winston from 'winston';
import config from './config.js';

export default winston.createLogger({
  level: config.logLevel,
  silent: process.env.NODE_ENV === 'production',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
