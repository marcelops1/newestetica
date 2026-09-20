import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from "@nestjs/common";
import { toValidationError } from "@newestetica/contracts";
import type { ZodType } from "zod";

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
