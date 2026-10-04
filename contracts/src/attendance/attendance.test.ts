import { describe, expect, it } from "vitest";
import { AttendanceInputSchema, AttendanceSchema } from "./attendance";

const validInput = {
  summary: "Limpeza de pele realizada, sem intercorrências.",
  performedAt: "2026-09-10T14:30:00.000Z",
};

const validAttendance = {
  id: "00000000-0000-4000-8000-000000000201",
  patientId: "00000000-0000-4000-8000-000000000101",
  summary: "Limpeza de pele realizada, sem intercorrências.",
  amountCents: 25_000,
  performedAt: "2026-09-10T14:30:00.000Z",
  createdAt: "2026-09-10T15:00:00.000Z",
  updatedAt: "2026-09-10T15:00:00.000Z",
};

describe("contrato de Atendimento (registro operacional + saída)", () => {
  it("aceita registro operacional válido e normaliza o resumo com trim", () => {
    const result = AttendanceInputSchema.safeParse({
      ...validInput,
      summary: "  Limpeza de pele realizada, sem intercorrências.  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe(
        "Limpeza de pele realizada, sem intercorrências.",
      );
    }
  });

  it("rejeita resumo vazio ou acima de 500 caracteres", () => {
    expect(
      AttendanceInputSchema.safeParse({ ...validInput, summary: "" }).success,
    ).toBe(false);
    expect(
      AttendanceInputSchema.safeParse({ ...validInput, summary: "   " })
        .success,
    ).toBe(false);
    expect(
      AttendanceInputSchema.safeParse({
        ...validInput,
        summary: "x".repeat(501),
      }).success,
    ).toBe(false);
  });

  it("rejeita data de realização fora do datetime ISO", () => {
    expect(
      AttendanceInputSchema.safeParse({
        ...validInput,
        performedAt: "10/09/2026 14:30",
      }).success,
    ).toBe(false);
    expect(
      AttendanceInputSchema.safeParse({
        ...validInput,
        performedAt: "2026-02-30T00:00:00.000Z",
      }).success,
    ).toBe(false);
    const withoutDate: Record<string, unknown> = { ...validInput };
    delete withoutDate.performedAt;
    expect(AttendanceInputSchema.safeParse(withoutDate).success).toBe(false);
  });

  it("ignora sem efeito campos clínicos ou fora do contrato (sem over-collection)", () => {
    const result = AttendanceInputSchema.safeParse({
      ...validInput,
      patientId: "00000000-0000-4000-8000-000000000101",
      diagnosis: "dado clínico que não deve entrar",
      prescription: "dado clínico que não deve entrar",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data).sort()).toEqual([
        "performedAt",
        "summary",
      ]);
    }
  });

  it("aceita datetime ISO com offset e normaliza para o mesmo instante", () => {
    const result = AttendanceInputSchema.safeParse({
      ...validInput,
      performedAt: "2026-09-10T11:30:00-03:00",
    });

    expect(result.success).toBe(true);
  });

  it("Attendance exige id/patientId/resumo/valor/data/timestamps", () => {
    expect(AttendanceSchema.safeParse(validAttendance).success).toBe(true);

    for (const field of [
      "id",
      "patientId",
      "summary",
      "amountCents",
      "performedAt",
      "createdAt",
      "updatedAt",
    ]) {
      const withoutField: Record<string, unknown> = { ...validAttendance };
      delete withoutField[field];
      expect(
        AttendanceSchema.safeParse(withoutField).success,
        `campo ${field} ausente deveria reprovar`,
      ).toBe(false);
    }
  });

  it("Attendance rejeita id fora do formato UUID do servidor", () => {
    expect(
      AttendanceSchema.safeParse({ ...validAttendance, id: "id-interno-1" })
        .success,
    ).toBe(false);
  });
});

describe("delta de valor no atendimento (amountCents)", () => {
  it("AttendanceInput aceita amountCents inteiro de 0 a 10.000.000 e preserva; ausente continua válido", () => {
    const withValue = AttendanceInputSchema.safeParse({
      ...validInput,
      amountCents: 15_000,
    });
    expect(withValue.success).toBe(true);
    if (withValue.success) {
      expect(withValue.data.amountCents).toBe(15_000);
    }

    expect(
      AttendanceInputSchema.safeParse({ ...validInput, amountCents: 0 })
        .success,
    ).toBe(true);
    expect(
      AttendanceInputSchema.safeParse({
        ...validInput,
        amountCents: 10_000_000,
      }).success,
    ).toBe(true);

    const withoutValue = AttendanceInputSchema.safeParse(validInput);
    expect(withoutValue.success).toBe(true);
    if (withoutValue.success) {
      expect(withoutValue.data.amountCents).toBeUndefined();
    }
  });

  it("rejeita amountCents fracionário, negativo, acima do teto ou não numérico", () => {
    for (const amountCents of [
      1.5,
      -1,
      10_000_001,
      "15000",
      Number.NaN,
      Number.MAX_SAFE_INTEGER,
    ]) {
      expect(
        AttendanceInputSchema.safeParse({ ...validInput, amountCents }).success,
        `amountCents hostil: ${String(amountCents)}`,
      ).toBe(false);
    }
  });

  it("Attendance exige amountCents inteiro-ou-nulo (nulo quando não informado)", () => {
    expect(AttendanceSchema.safeParse(validAttendance).success).toBe(true);
    expect(
      AttendanceSchema.safeParse({ ...validAttendance, amountCents: null })
        .success,
    ).toBe(true);
    expect(
      AttendanceSchema.safeParse({ ...validAttendance, amountCents: 1.5 })
        .success,
    ).toBe(false);
    expect(
      AttendanceSchema.safeParse({ ...validAttendance, amountCents: "25000" })
        .success,
    ).toBe(false);
  });
});
