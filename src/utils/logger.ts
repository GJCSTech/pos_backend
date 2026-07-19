import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env, isTest } from '../config/env';

const logDir = path.resolve(process.cwd(), env.LOG_DIR);

if (!isTest && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const rest = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${String(timestamp)} [${level}] ${String(message)}${rest}`;
  }),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: env.NODE_ENV === 'production' ? jsonFormat : consoleFormat,
    silent: isTest,
  }),
];

if (!isTest) {
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: env.LOG_LEVEL,
      format: jsonFormat,
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: jsonFormat,
    }),
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'vj-garden-pos-backend' },
  transports,
});
