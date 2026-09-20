import { z } from "zod";

/** Telefone/WhatsApp com DDD: mínimo 10 dígitos — mesma regra do mock do frontend. */
const hasDddDigits = (value: string) => value.replace(/\D/g, "").length >= 10;

/** Solicitação de orçamento. O procedimento é restrito às opções vigentes passadas na criação. */
export function createQuoteInputSchema(procedureOptions: readonly string[]) {
  return z.object({
    name: z.string().trim().min(2),
    phone: z.string().refine(hasDddDigits),
    procedure: z
      .string()
      .optional()
      .refine(
        (value) =>
          value === undefined ||
          value.trim() === "" ||
          procedureOptions.includes(value),
      ),
    message: z.string().optional(),
  });
}

export type QuoteInput = z.infer<ReturnType<typeof createQuoteInputSchema>>;
