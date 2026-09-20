import { z } from "zod";

/** Telefone/WhatsApp com DDD: mínimo 10 dígitos — mesma regra do mock do frontend. */
const hasDddDigits = (value: string) => value.replace(/\D/g, "").length >= 10;

/** Solicitação de agendamento self-service. Espelha o payload do modal público. */
export const BookingInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().max(20).refine(hasDddDigits),
  treatment: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof BookingInputSchema>;
