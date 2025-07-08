
import { FastifyInstance, FastifyRequest } from "fastify";
import { logger } from "../utils/logger.instance";

export const preRequestHandlerPlugin = (fastify: FastifyInstance) => {
  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    logger.info({
      req: {
        id: request.id,
        method: request.method,
        url: request.url,
      },
    }, `Incoming request: [${request.method}] ${request.url}`);
  });
}; 