import { z } from "zod";

/** Slot de disponibilidade criado pela administração. Espelha `Slot` dos mocks. */
export const SlotSchema = z.object({
  id: z.string().min(1),
  start: z.iso.datetime({ offset: true }),
  durationMinutes: z.number().int().positive(),
  available: z.boolean(),
});

export type Slot = z.infer<typeof SlotSchema>;
