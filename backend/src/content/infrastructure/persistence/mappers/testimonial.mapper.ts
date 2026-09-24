import type { Testimonial as TestimonialRecord } from "../../../../generated/prisma/client";
import { Testimonial } from "../../../domain/entities/testimonial.entity";

/* Data Mapper (docs/architecture/04-decisoes-tecnicas.md §5): o registro do ORM nunca
   cruza para o domínio; a validação é do `restore` (fonte única). */
export function toTestimonialDomain(record: TestimonialRecord): Testimonial {
  return Testimonial.restore({
    id: record.id,
    quote: record.quote,
    author: record.author,
    context: record.context,
  });
}
