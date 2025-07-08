import { FastifyRateLimitOptions } from "@fastify/rate-limit";

export const RATE_LIMIT_MINUTES = "10 minutes"

export const rateLimitOptions: FastifyRateLimitOptions = {
  global: true,
  max: 100,
  timeWindow: RATE_LIMIT_MINUTES,
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: "Too Many Requests",
    message: `You have exceeded the rate limit. Please try again in ${RATE_LIMIT_MINUTES}.`,
  }),
};