-- Valor opcional do atendimento em centavos (UC 4.2.6): nullable = atendimentos
-- existentes continuam válidos, sem backfill inventando valor (migration plan do design).
ALTER TABLE "Attendance" ADD COLUMN "amountCents" INTEGER;
