import type { FastifyCorsOptions } from "@fastify/cors";
import { env } from "./env.config";

export const corsOptions: FastifyCorsOptions = {
  origin: env.ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};