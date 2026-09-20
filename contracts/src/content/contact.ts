import { z } from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hasDddDigits = (value: string) => value.replace(/\D/g, "").length >= 10;

/** Contato flexível: e-mail válido OU WhatsApp com DDD — mesma regra do mock. */
const isEmailOrPhone = (value: string) =>
  EMAIL_PATTERN.test(value.trim()) || hasDddDigits(value);

/** Mensagem de contato. Espelha o payload do formulário público. */
export const ContactInputSchema = z.object({
  name: z.string().trim().min(2),
  contact: z.string().refine(isEmailOrPhone),
  message: z.string().trim().min(1),
});

export type ContactInput = z.infer<typeof ContactInputSchema>;
