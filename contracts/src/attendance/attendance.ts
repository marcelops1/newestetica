import { z } from "zod";

/** Registro mínimo do que foi realizado (UC 4.2.5): resumo operacional e data.
 *  O vínculo com a paciente vive no path da rota (`/patients/:patientId/attendances`)
 *  — nunca duplicado no corpo (emenda do apply, decisão 1 do design). */
export const AttendanceInputSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  /* Aceita UTC (`Z`) e offset explícito (`-03:00`): o cliente administrativo informa
     a data real do atendimento no fuso local; o instante continua inequívoco. */
  performedAt: z.iso.datetime({ offset: true }),
});

/** Saída: UUID gerado pelo servidor e timestamps ISO; sem PII além do vínculo
 *  (nenhum nome de paciente — o histórico é operacional, sem prontuário). */
export const AttendanceSchema = z.object({
  id: z.uuid(),
  patientId: z.string().min(1),
  summary: z.string().min(1),
  performedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Attendance = z.infer<typeof AttendanceSchema>;
export type AttendanceInput = z.infer<typeof AttendanceInputSchema>;
