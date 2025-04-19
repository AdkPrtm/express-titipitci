import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  // Console logger
  new winston.transports.Console(),

  // Error log file
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),

  new winston.transports.File({
    filename: path.join(logDir, 'warn.log'),
    level: 'warn',
  }),

  // Combined log file (all levels)
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
  }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'http' : 'debug',
  levels,
  format,
  transports,
});
