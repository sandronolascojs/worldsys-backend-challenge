import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorBase } from '../utils/errors/error.base';
import { logger } from '../utils/logger.instance';

export const errorHandlerPlugin = (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const requestContext = {
      id: request.id,
      method: request.method,
      url: request.url,
      params: request.params,
      body: request.body,
      query: request.query,
    };

    if (error instanceof ErrorBase) {
      logger.error({ err: error, req: requestContext }, 'Handled application error');
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }

    logger.error({ err: error, req: requestContext }, 'Unhandled error');
    return reply.status(500).send({
      statusCode: 500,
      error: 'InternalServerError',
      message: 'An unexpected error occurred.',
    });
  });
};
