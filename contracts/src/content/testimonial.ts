import { z } from "zod";

/** Depoimento público. Espelha `Testimonial` dos mocks (autoria sempre fictícia). */
export const TestimonialSchema = z.object({
  id: z.string().min(1),
  quote: z.string().min(1),
  author: z.string().min(1),
  context: z.string().min(1),
});

export type Testimonial = z.infer<typeof TestimonialSchema>;
