import "dotenv/config";

import fastify from "fastify";
import cors from "@fastify/cors";
import { corsOptions } from "./config/cors.options";
import rateLimit from "@fastify/rate-limit";
import { rateLimitOptions } from "./config/rateLimit.options";
import { logger, loggerOptions } from "./utils/logger.instance";
import { preRequestHandlerPlugin } from "./plugins/preRequestHandler.plugin";
import { errorHandlerPlugin } from "./plugins/errorHandler.plugin";
import { env } from "./config/env.config";
import { publicController } from "./controllers/public.controller";

const server = fastify({ logger: loggerOptions })

server.register(cors, corsOptions)
server.register(rateLimit, rateLimitOptions)

server.register(preRequestHandlerPlugin)
server.register(errorHandlerPlugin)

server.register((instance) => {
  instance.register(publicController)
}, { prefix: "/api/v1" })

server.listen({ port: env.PORT }, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.info(`Server is running on port ${env.PORT} in ${env.APP_ENV} mode`);
});



