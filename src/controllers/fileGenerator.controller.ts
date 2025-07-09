import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDbPool } from '../lib/db.lib';
import { UsersRepository } from '../repositories/users.repository';
import { FileGeneratorService } from '../services/fileGenerator.service';
import { UserService } from '../services/user.service';
import { UserFileProcessorService } from '../services/userFileProcessor.service';
import { logger } from '../utils/logger.instance';

const fileGeneratorService = new FileGeneratorService();

const generateFileSchema = z.object({
  size: z.string().refine(
    (size) => {
      const parsedSize = fileGeneratorService.parseSize(size);
      return parsedSize > 0;
    },
    { message: 'Invalid size format' },
  ),
  errorRate: z.number().default(0.0).optional(),
});

export const fileGeneratorController = async (fastify: FastifyInstance) => {
  fastify.post('/generate-file', async (request, reply) => {
    const schemaResult = await generateFileSchema.safeParseAsync(request.body);
    if (!schemaResult.success) {
      return reply
        .status(400)
        .send({ error: 'Invalid request body', details: schemaResult.error.issues });
    }

    const { size, errorRate } = schemaResult.data;
    let targetBytes = fileGeneratorService.parseSize(size);

    const errorRateNum = typeof errorRate === 'number' ? errorRate : 0.0;
    const records = fileGeneratorService.estimateRecords(targetBytes);

    try {
      await fileGeneratorService.runFileGenerator(records, errorRateNum);
    } catch (err) {
      return reply.status(500).send({
        error: 'File generation failed',
        details: err instanceof Error ? err.message : err,
      });
    }

    return reply.status(200).send({ status: 'success' });
  });

  // Endpoint para iniciar el procesamiento del archivo generado
  fastify.post('/start-processing', async (_request, reply) => {
    const pool = await getDbPool();
    const userService = new UserService(new UsersRepository(pool));
    const processor = new UserFileProcessorService(userService, logger);
    try {
      await processor.processFile();
      return { status: 'processing completed' };
    } catch (err) {
      return reply
        .status(500)
        .send({ error: 'Processing failed', details: err instanceof Error ? err.message : err });
    }
  });
};
