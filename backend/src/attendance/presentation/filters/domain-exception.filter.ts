import { HttpStatus } from "@nestjs/common";
import { DomainExceptionFilter as SharedDomainExceptionFilter } from "../../../shared/http/domain-exception.filter";
import {
  AttendanceNotFound,
  DomainError,
  PatientNotFound,
} from "../../domain/errors/errors";

/* Subclasse fina local: só o mapa código→status é do módulo (o resto é kernel
   compartilhado — docs/architecture/02-arquitetura.md §3, exceção do kernel).
   Paciente invisível e atendimento invisível respondem 404 (anti-enumeração). */
export class DomainExceptionFilter extends SharedDomainExceptionFilter {
  protected statusFor(error: DomainError): number {
    if (error instanceof PatientNotFound || error instanceof AttendanceNotFound) {
      return HttpStatus.NOT_FOUND;
    }
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
