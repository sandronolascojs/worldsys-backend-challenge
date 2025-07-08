import { ErrorBase } from './error.base';
import { StatusCode } from './statusCode.enum';

export class InternalError extends ErrorBase {
  constructor({ message }: { message: string }) {
    super({
      message,
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
    });
  }
}
