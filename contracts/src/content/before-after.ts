import { z } from "zod";

/** Caso de antes/depois. `hasConsent` é OBRIGATÓRIO — sem consentimento claro, não aparece. */
export const BeforeAfterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  sessions: z.string().min(1),
  recovery: z.string().min(1),
  goal: z.string().min(1),
  hasConsent: z.boolean(),
});

/** Formato público: somente casos com consentimento verdadeiro. */
export const PublicBeforeAfterSchema = BeforeAfterSchema.extend({
  hasConsent: z.literal(true),
});

export const PublicBeforeAfterListSchema = z.array(PublicBeforeAfterSchema);

export type BeforeAfter = z.infer<typeof BeforeAfterSchema>;
export type PublicBeforeAfter = z.infer<typeof PublicBeforeAfterSchema>;

/** Produz a listagem pública: somente casos com consentimento explícito. */
export function selectPublicResults(items: BeforeAfter[]): BeforeAfter[] {
  return items.filter((item) => item.hasConsent);
}
