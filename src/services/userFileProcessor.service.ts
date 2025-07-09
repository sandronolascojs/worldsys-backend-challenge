import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import type { Logger } from 'pino';
import { z } from 'zod';
import { env } from '../config/env.config';
import { UserInsert, userToInsertSchema } from '../types/user';
import { UserService } from './user.service';

// Permite configurar el tamaño de batch por variable de entorno
const BATCH_SIZE = env.BATCH_SIZE;
const CHECKPOINT_FILE = env.CHECKPOINT_FILE;

export type UserToInsert = z.infer<typeof userToInsertSchema>;

export class UserFileProcessorService {
  private readonly filePath: string;
  private readonly checkpointFile: string;

  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
    filePath?: string,
    checkpointFile?: string,
  ) {
    this.filePath =
      filePath ||
      path.resolve(__dirname, '../lib/data-generator/challenge/input/CLIENTES_IN_0425.dat');
    this.checkpointFile = checkpointFile || CHECKPOINT_FILE;
  }

  /**
   * Procesa el archivo de usuarios en batches, tolerando errores, logueando métricas y progreso,
   * y soportando resumibilidad ante fallos mediante checkpoint.
   */
  async processFile(): Promise<void> {
    this.logger.info(`Starting processing file: ${this.filePath}`);
    const startTime = Date.now();
    let fileSize = 0;
    try {
      fileSize = fs.statSync(this.filePath).size;
    } catch (err) {
      this.logger.error(`Could not get file size for progress tracking: ${err}`);
    }
    let bytesRead = 0;

    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let batch: UserInsert[] = [];
    let total = 0;
    let failed = 0;
    let processed = 0;

    // Manejo de shutdown limpio
    let shuttingDown = false;
    const shutdownHandler = () => {
      shuttingDown = true;
      this.logger.warn('Shutdown signal received. Finishing current batch and exiting...');
      rl.close();
      fileStream.close();
    };
    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);

    // Cargar checkpoint
    const lastCheckpoint = this.loadCheckpoint();
    if (lastCheckpoint > 0) {
      this.logger.info(`Resuming from checkpoint. Skipping ${lastCheckpoint} lines...`);
    }

    for await (const line of rl) {
      if (shuttingDown) break;
      total++;
      if (total <= lastCheckpoint) continue; // Saltar líneas ya procesadas
      bytesRead += Buffer.byteLength(line, 'utf8') + 1; // +1 for newline
      const user = this.parseLine(line);
      if (user) {
        batch.push(user);
      } else {
        failed++;
        this.logger.warn(`Invalid line at ${total}: ${line}`);
      }

      if (batch.length >= BATCH_SIZE) {
        const batchStart = Date.now();
        await this.insertBatch(batch);
        processed += batch.length;
        this.saveCheckpoint(total); // Guardar checkpoint después de cada batch
        this.logger.info(`Inserted batch. Total processed: ${processed}`);
        this.logger.info(
          `Batch processed in ${Date.now() - batchStart}ms. Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        );
        if (fileSize > 0) {
          const percent = ((bytesRead / fileSize) * 100).toFixed(2);
          this.logger.info(`Progress: ${percent}% (${bytesRead}/${fileSize} bytes)`);
        }
        batch = [];
      }
    }

    // Insertar lo que quede
    if (batch.length > 0 && !shuttingDown) {
      const batchStart = Date.now();
      await this.insertBatch(batch);
      processed += batch.length;
      this.saveCheckpoint(total); // Guardar checkpoint final
      this.logger.info(`Inserted final batch. Total processed: ${processed}`);
      this.logger.info(
        `Batch processed in ${Date.now() - batchStart}ms. Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      );
    }

    // Remove checkpoint file after processing is complete
    if (fs.existsSync(this.checkpointFile)) {
      fs.unlinkSync(this.checkpointFile);
      this.logger.info(`Checkpoint file ${this.checkpointFile} removed after processing.`);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    this.logger.info(
      `File processing completed in ${totalTime}s. Total: ${total}, Inserted: ${processed}, Failed: ${failed}. Peak memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
    );
    process.off('SIGINT', shutdownHandler);
    process.off('SIGTERM', shutdownHandler);
  }

  /**
   * Parsea una línea del archivo a un objeto UserInsert válido, o null si es inválida.
   */
  private parseLine(line: string): UserInsert | null {
    const [nombre, apellido, dni, estado, fechaIngreso, esPep, esSujetoObligado] = line.split('|');
    if (!nombre || !apellido || !dni || !estado || !fechaIngreso || !esPep) return null;

    const NombreCompleto = `${nombre.trim()} ${apellido.trim()}`;
    const DNI = parseInt(dni, 10);
    if (isNaN(DNI)) return null;

    const Estado = estado.trim();

    let FechaIngreso: Date;
    const dateMatch = fechaIngreso.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateMatch) return null;
    const [, month, day, year] = dateMatch;
    FechaIngreso = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(FechaIngreso.getTime())) return null;

    const EsPEP = esPep.trim().toLowerCase() === 'true';
    let EsSujetoObligado: boolean | null = null;
    if (esSujetoObligado !== undefined && esSujetoObligado.trim() !== '') {
      EsSujetoObligado = esSujetoObligado.trim().toLowerCase() === 'true';
    }

    const result = userToInsertSchema.safeParse({
      NombreCompleto,
      DNI,
      Estado,
      FechaIngreso,
      EsPEP,
      EsSujetoObligado,
    });

    if (!result.success) {
      this.logger.warn(`Validation failed: ${JSON.stringify(result.error.issues)}`);
      return null;
    }

    return result.data;
  }

  /**
   * Inserta un batch de usuarios con reintentos y logueo de errores.
   */
  private async insertBatch(batch: UserInsert[]): Promise<void> {
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      try {
        await this.userService.bulkInsertUsers(batch);
        return;
      } catch (error) {
        attempts++;
        this.logger.error(`Error inserting batch (attempt ${attempts})`, { error });
        if (attempts >= maxAttempts) {
          fs.appendFileSync('failed_batches.log', JSON.stringify(batch) + '\n');
        }
      }
    }
  }

  private saveCheckpoint(lineNumber: number) {
    fs.writeFileSync(this.checkpointFile, lineNumber.toString());
  }

  private loadCheckpoint(): number {
    if (fs.existsSync(this.checkpointFile)) {
      return parseInt(fs.readFileSync(this.checkpointFile, 'utf8'), 10) || 0;
    }
    return 0;
  }
}
