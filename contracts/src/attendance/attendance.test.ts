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

  it("Attendance exige id/patientId/resumo/data/timestamps", () => {
    expect(AttendanceSchema.safeParse(validAttendance).success).toBe(true);

    for (const field of [
      "id",
      "patientId",
      "summary",
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
