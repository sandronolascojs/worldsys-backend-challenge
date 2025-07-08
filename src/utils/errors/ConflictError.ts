import { ErrorBase } from './error.base';
import { StatusCode } from './statusCode.enum';

export class ConflictError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({ message, statusCode: StatusCode.CONFLICT });
  }
}
