import { spawn } from 'node:child_process';
import path from 'node:path';

export class FileGeneratorService {
  private readonly AVG_LINE_SIZE = 100;
  private readonly generatorPath: string;
  private readonly outputPath: string;

  constructor(outputPath?: string, generatorPath?: string) {
    this.outputPath = outputPath
      ? path.resolve(outputPath)
      : path.resolve(
          process.cwd(),
          './src/lib/data-generator/challenge/input/CLIENTES_IN_0425.dat',
        );
    this.generatorPath =
      generatorPath || path.resolve(process.cwd(), './src/lib/data-generator/generateFile.ts');
  }

  /**
   * Parsea un string de tamaño tipo '2gb', '500mb', etc. a bytes.
   */
  parseSize(sizeStr: string): number {
    const match = /^([\d.]+)\s*(gb|mb|kb|b)?$/i.exec(sizeStr.trim());
    if (!match) throw new Error('Invalid size format');
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'b').toLowerCase();
    switch (unit) {
      case 'gb':
        return value * 1024 * 1024 * 1024;
      case 'mb':
        return value * 1024 * 1024;
      case 'kb':
        return value * 1024;
      case 'b':
      default:
        return value;
    }
  }

  /**
   * Estima la cantidad de registros necesarios para alcanzar el tamaño deseado.
   */
  estimateRecords(targetBytes: number): number {
    return Math.floor(targetBytes / this.AVG_LINE_SIZE);
  }

  /**
   * Ejecuta el generador de archivos con los parámetros dados.
   *
   * Usamos un child process porque el generador es un script CLI y así lo podemos ejecutar tal cual, sin tener que modificarlo ni preocuparnos por errores que puedan afectar el servidor principal.
   * Además, esto evita que el proceso de generación bloquee la API, y si algo falla, solo falla el proceso hijo, no todo el backend.
   * Es una forma simple y segura de correr scripts externos, sobre todo en entornos con pocos recursos como un pod de Kubernetes.
   *
   * @param records Número de registros a generar
   * @param errorRate Porcentaje de errores (0 a 1)
   * @returns Promise<void>
   */
  async runFileGenerator(records: number, errorRate: number): Promise<void> {
    const env = { ...process.env, RECORDS: records.toString(), ERROR_RATE: errorRate.toString() };
    return new Promise<void>((resolve, reject) => {
      const child = spawn('npx', ['tsx', this.generatorPath, this.outputPath], { env });
      child.stdout.on('data', (data) => process.stdout.write(data));
      child.stderr.on('data', (data) => process.stderr.write(data));
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Generator failed'));
      });
    });
  }
}
