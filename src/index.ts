import 'dotenv/config';

import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastify from 'fastify';
import { corsOptions } from './config/cors.options';
import { env } from './config/env.config';
import { rateLimitOptions } from './config/rateLimit.options';
import { fileGeneratorController } from './controllers/fileGenerator.controller';
import { publicController } from './controllers/public.controller';
import { errorHandlerPlugin } from './plugins/errorHandler.plugin';
import { preRequestHandlerPlugin } from './plugins/preRequestHandler.plugin';
import { logger, loggerOptions } from './utils/logger.instance';

const server = fastify({ logger: loggerOptions });

server.register(cors, corsOptions);
server.register(rateLimit, rateLimitOptions);

server.register(preRequestHandlerPlugin);
server.register(errorHandlerPlugin);

server.register(
  (instance) => {
    instance.register(publicController);
    instance.register(fileGeneratorController);
  },
  { prefix: '/api/v1' },
);

server.listen({ port: env.PORT }, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.info(`Server is running on port ${env.PORT} in ${env.APP_ENV} mode`);
});
