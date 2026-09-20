import { z } from "zod";

/** Categorias válidas de tratamento — mesmas do filtro público. */
export const TREATMENT_CATEGORIES = [
  "facial",
  "corporal",
  "rejuvenescimento",
] as const;

export const TreatmentCategorySchema = z.enum(TREATMENT_CATEGORIES);

/** Procedimento do catálogo público. Espelha `Procedure` dos mocks do frontend. */
export const ProcedureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  categories: z.array(TreatmentCategorySchema).min(1),
});

export type TreatmentCategory = z.infer<typeof TreatmentCategorySchema>;
export type Procedure = z.infer<typeof ProcedureSchema>;
