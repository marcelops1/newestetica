import { z } from "zod";

/** Telefone/WhatsApp com DDD: mínimo 10 dígitos — mesma regra do mock do frontend. */
const hasDddDigits = (value: string) => value.replace(/\D/g, "").length >= 10;

/** Solicitação de agendamento self-service. Espelha o payload do modal público. */
export const BookingInputSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().refine(hasDddDigits),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof BookingInputSchema>;
