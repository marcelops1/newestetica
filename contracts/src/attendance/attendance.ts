import { z } from "zod";

/** Teto do valor em centavos (R$ 100.000): bound do contrato e do núcleo. */
export const MAX_ATTENDANCE_AMOUNT_CENTS = 10_000_000;

/** Registro mínimo do que foi realizado (UC 4.2.5): resumo operacional, data e valor
 *  opcional em centavos inteiros (UC 4.2.6). O vínculo com a paciente vive no path da
 *  rota (`/patients/:patientId/attendances`) — nunca duplicado no corpo (emenda do
 *  apply, decisão 1 do design). Valor ausente = atendimento sem valor fechado. */
export const AttendanceInputSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  /* Aceita UTC (`Z`) e offset explícito (`-03:00`): o cliente administrativo informa
     a data real do atendimento no fuso local; o instante continua inequívoco. */
  performedAt: z.iso.datetime({ offset: true }),
  /* Centavos inteiros com teto: sem limite o campo aceitaria MAX_SAFE_INTEGER como
     "preço"; float em reais é bug agendado (design decisão 1). */
  amountCents: z
    .number()
    .int()
    .min(0)
    .max(MAX_ATTENDANCE_AMOUNT_CENTS)
    .optional(),
});

/** Saída: UUID gerado pelo servidor, valor em centavos (inteiro ou nulo — nulo quando
 *  não informado na criação, imutável depois dela) e timestamps ISO; sem PII além do
 *  vínculo (nenhum nome de paciente — o histórico é operacional, sem prontuário). */
export const AttendanceSchema = z.object({
  id: z.uuid(),
  patientId: z.string().min(1),
  summary: z.string().min(1),
  amountCents: z.number().int().nullable(),
  performedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Attendance = z.infer<typeof AttendanceSchema>;
export type AttendanceInput = z.infer<typeof AttendanceInputSchema>;
