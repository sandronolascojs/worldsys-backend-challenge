import { z } from 'zod';

const rawEnv = {
  APP_ENV: process.env.APP_ENV,
  PORT: process.env.PORT,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  LOG_LEVEL: process.env.LOG_LEVEL,
  DATABASE_URL: process.env.DATABASE_URL,
  BATCH_SIZE: process.env.BATCH_SIZE,
  CHECKPOINT_FILE: process.env.CHECKPOINT_FILE,
};

export const _env = z
  .object({
    // environment
    APP_ENV: z
      .enum(['development', 'production'])
      .default('development')
      .describe('The environment to run the server on'),
    PORT: z.coerce.number().default(8000).describe('The port to run the server on'),
    ALLOWED_ORIGINS: z
      .string()
      .transform((val) =>
        val
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .describe('The allowed origins of the server'),
    BATCH_SIZE: z.coerce
      .number()
      .default(1000)
      .describe('The batch size to use for the file processor'),
    CHECKPOINT_FILE: z
      .string()
      .default('processing.checkpoint')
      .describe('The checkpoint file to use for the file processor'),

    // logging
    LOG_LEVEL: z
      .enum(['debug', 'info', 'warn', 'error'])
      .default('info')
      .describe('The level of logging to use'),

    // database
    DB_HOST: z.string().describe('The host of the database to connect to'),
    DB_USER: z.string().describe('The user of the database to connect to'),
    DB_PASSWORD: z.string().describe('The password of the database to connect to'),
    DB_NAME: z.string().describe('The name of the database to connect to'),
  })
  .safeParse(rawEnv);

if (!_env.success) {
  throw new Error('Invalid environment variables: ' + JSON.stringify(_env.error.format()));
}

export const env = _env.data;
