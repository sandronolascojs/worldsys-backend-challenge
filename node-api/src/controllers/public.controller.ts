import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const publicController = async (fastify: FastifyInstance) => {
  fastify.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ status: "ok" });
  });
};
