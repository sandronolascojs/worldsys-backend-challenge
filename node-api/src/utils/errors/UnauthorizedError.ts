import { ErrorBase } from './error.base';
import { StatusCode } from './statusCode.enum';

export class UnauthorizedError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({ message, statusCode: StatusCode.UNAUTHORIZED });
  }
}
