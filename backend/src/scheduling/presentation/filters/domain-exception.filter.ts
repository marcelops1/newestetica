import { HttpStatus } from "@nestjs/common";
import { DomainExceptionFilter as SharedDomainExceptionFilter } from "../../../shared/http/domain-exception.filter";
import {
  DomainError,
  SlotAlreadyBooked,
  SlotNotFound,
} from "../../domain/errors/errors";

/* Subclasse fina local: só o mapa código→status é do módulo (o resto é kernel
   compartilhado — docs/architecture/02-arquitetura.md §3, exceção do kernel). */
export class DomainExceptionFilter extends SharedDomainExceptionFilter {
  protected statusFor(error: DomainError): number {
    if (error instanceof SlotNotFound) {
      return HttpStatus.NOT_FOUND;
    }
    if (error instanceof SlotAlreadyBooked) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
