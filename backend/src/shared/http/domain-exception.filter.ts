import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { DomainError } from "../errors/domain-error";

type HttpResponse = {
  status(code: number): { json(body: unknown): void };
};

/* Kernel técnico compartilhado (docs/architecture/02-arquitetura.md §3, exceção do
   kernel): o `catch` e o formato `{code, message}` são plumbing puro; o mapa
   código→status é hook local do módulo (`statusFor`, default 422). O compartilhado
   nunca importa de módulos. */
@Catch(DomainError)
export abstract class DomainExceptionFilter implements ExceptionFilter {
  protected statusFor(error: DomainError<string>): number {
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }

  catch(error: DomainError<string>, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    response.status(this.statusFor(error)).json({
      code: error.code,
      message: error.message,
    });
  }
}
