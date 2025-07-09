import pino, { LoggerOptions } from 'pino';
import { env } from '../config/env.config';

const isProduction = env.APP_ENV === 'production';
const level = env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

export const loggerOptions: LoggerOptions = {
  level,
  redact: ['req.headers.authorization', 'user.password'],
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        },
      }),
};

export const logger = pino(loggerOptions);
