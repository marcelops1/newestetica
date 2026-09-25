import { z } from "zod";

/** Telefone/WhatsApp com DDD: mínimo 10 dígitos — mesma regra do booking. */
const hasDddDigits = (value: string) => value.replace(/\D/g, "").length >= 10;

/** Status do cadastro: ativo ou anonimizado (PII substituída; nunca servido em leitura). */
export const PatientStatusSchema = z.enum(["active", "anonymized"]);

/** Cadastro mínimo: nome, contato e finalidade informada (sem dado clínico, sem e-mail). */
export const PatientInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().max(20).refine(hasDddDigits),
  purpose: z.string().trim().min(1).max(200),
});

/** Atualização parcial: subconjunto do cadastro; status/id/timestamps não são atualizáveis. */
export const PatientUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().max(20).refine(hasDddDigits).optional(),
  purpose: z.string().trim().min(1).max(200).optional(),
});

/** Saída: UUID gerado pelo servidor, timestamps e status; anonimizado nunca é servido. */
export const PatientSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  purpose: z.string().min(1),
  status: PatientStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Patient = z.infer<typeof PatientSchema>;
export type PatientInput = z.infer<typeof PatientInputSchema>;
export type PatientStatus = z.infer<typeof PatientStatusSchema>;
export type PatientUpdate = z.infer<typeof PatientUpdateSchema>;
