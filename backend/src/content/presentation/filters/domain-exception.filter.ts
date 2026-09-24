import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { DomainError, PostNotFound } from "../../domain/errors/errors";

type HttpResponse = {
  status(code: number): { json(body: unknown): void };
};

function statusFor(error: DomainError): number {
  if (error instanceof PostNotFound) {
    return HttpStatus.NOT_FOUND;
  }
  return HttpStatus.UNPROCESSABLE_ENTITY;
}

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    response.status(statusFor(error)).json({
      code: error.code,
      message: error.message,
    });
  }
}
