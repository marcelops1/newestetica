import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from "@nestjs/common";
import { toValidationError } from "@newestetica/contracts";
import type { ZodType } from "zod";

/* Cópia local do módulo Conteúdo Público: bounded contexts não compartilham apresentação
   (docs/architecture/02-arquitetura.md §3); o formato é o mesmo dos demais módulos. */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new UnprocessableEntityException(toValidationError(result.error));
    }
    return result.data;
  }
}
