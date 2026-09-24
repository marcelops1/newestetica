import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from "@nestjs/common";
import { toValidationError } from "@newestetica/contracts";
import type { ZodType } from "zod";

/* Kernel técnico compartilhado (docs/architecture/02-arquitetura.md §3, exceção do
   kernel): plumbing puro, sem vocabulário de domínio. O compartilhado nunca importa
   de módulos; os módulos importam só o plumbing previsto na exceção. */
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
