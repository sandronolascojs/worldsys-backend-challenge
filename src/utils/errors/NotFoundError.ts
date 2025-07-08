import { ErrorBase } from './error.base';
import { StatusCode } from './statusCode.enum';

export class NotFoundError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({ message, statusCode: StatusCode.NOT_FOUND });
  }
}
