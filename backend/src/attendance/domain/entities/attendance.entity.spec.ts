import { describe, expect, it } from "vitest";
import { MAX_ATTENDANCE_AMOUNT_CENTS as CONTRACT_MAX_AMOUNT_CENTS } from "@newestetica/contracts";
import { Attendance, MAX_ATTENDANCE_AMOUNT_CENTS } from "./attendance.entity";
import { InvalidAttendance } from "../errors/errors";

const validProps = {
  id: "00000000-0000-4000-8000-000000000201",
  patientId: "00000000-0000-4000-8000-000000000101",
  summary: "Limpeza de pele realizada, sem intercorrências.",
  performedAt: new Date("2026-09-10T14:30:00.000Z"),
};

describe("Attendance (entidade imutável)", () => {
  it("create preserva vínculo, resumo e data e gera os timestamps", () => {
    const attendance = Attendance.create(validProps);

    expect(attendance.id).toBe(validProps.id);
    expect(attendance.patientId).toBe(validProps.patientId);
    expect(attendance.summary).toBe(validProps.summary);
    expect(attendance.performedAt.toISOString()).toBe(
      validProps.performedAt.toISOString(),
    );
    expect(attendance.createdAt).toBeInstanceOf(Date);
    expect(attendance.updatedAt).toBeInstanceOf(Date);
    expect(attendance.createdAt.getTime()).toBe(attendance.updatedAt.getTime());
  });

  it("aceita resumo com exatamente 500 caracteres e resumo de 1 caractere", () => {
    const attendance = Attendance.create({
      ...validProps,
      summary: "x".repeat(500),
    });
    expect(attendance.summary).toHaveLength(500);

    const minimal = Attendance.create({ ...validProps, summary: "x" });
    expect(minimal.summary).toBe("x");
  });

  it("rejeita id vazio, paciente vazia, resumo vazio ou acima de 500 e data inválida", () => {
    expect(() => Attendance.create({ ...validProps, id: "  " })).toThrow(
      InvalidAttendance,
    );
    expect(() => Attendance.create({ ...validProps, patientId: "  " })).toThrow(
      InvalidAttendance,
    );
    expect(() => Attendance.create({ ...validProps, summary: "" })).toThrow(
      InvalidAttendance,
    );
    expect(() => Attendance.create({ ...validProps, summary: "   " })).toThrow(
      InvalidAttendance,
    );
    expect(() =>
      Attendance.create({ ...validProps, summary: "x".repeat(501) }),
    ).toThrow(InvalidAttendance);
    expect(() =>
      Attendance.create({ ...validProps, performedAt: new Date("inválida") }),
    ).toThrow(InvalidAttendance);
  });

  it("não expõe update/delete/anonimização — histórico é imutável por desenho", () => {
    const attendance = Attendance.create(validProps) as unknown as Record<
      string,
      unknown
    >;

    expect(attendance.update).toBeUndefined();
    expect(attendance.delete).toBeUndefined();
    expect(attendance.remove).toBeUndefined();
    expect(attendance.anonymize).toBeUndefined();
  });

  it("restore valida snapshot corrompido vindo da persistência", () => {
    const snapshot = {
      ...validProps,
      amountCents: null,
      summary: "   ",
      createdAt: new Date("2026-09-10T15:00:00.000Z"),
      updatedAt: new Date("2026-09-10T15:00:00.000Z"),
    };

    expect(() => Attendance.restore(snapshot)).toThrow(InvalidAttendance);
  });

  it("restore rejeita timestamps inválidos ou de tipo errado (banco não é fonte confiável)", () => {
    const base = {
      ...validProps,
      amountCents: null,
      createdAt: new Date("2026-09-10T15:00:00.000Z"),
      updatedAt: new Date("2026-09-10T15:00:00.000Z"),
    };

    expect(() =>
      Attendance.restore({ ...base, createdAt: new Date("inválida") }),
    ).toThrow(InvalidAttendance);
    expect(() =>
      Attendance.restore({ ...base, updatedAt: new Date("inválida") }),
    ).toThrow(InvalidAttendance);
    expect(() =>
      Attendance.restore({ ...base, createdAt: "2026-09-10" as never }),
    ).toThrow(InvalidAttendance);
    expect(() =>
      Attendance.restore({ ...base, updatedAt: "2026-09-10" as never }),
    ).toThrow(InvalidAttendance);
  });

  it("rejeita objetos que apenas imitam strings em id/paciente (tipo confundido)", () => {
    const idLike = { trim: () => "id-fictício" } as never;
    const patientLike = { trim: () => "paciente-fictícia" } as never;

    expect(() => Attendance.create({ ...validProps, id: idLike })).toThrow(
      InvalidAttendance,
    );
    expect(() =>
      Attendance.create({ ...validProps, patientId: patientLike }),
    ).toThrow(InvalidAttendance);
  });

  it("restore preserva os timestamps originais da persistência", () => {
    const createdAt = new Date("2026-09-10T15:00:00.000Z");
    const updatedAt = new Date("2026-09-11T09:00:00.000Z");

    const attendance = Attendance.restore({
      ...validProps,
      amountCents: null,
      createdAt,
      updatedAt,
    });

    expect(attendance.createdAt.toISOString()).toBe(createdAt.toISOString());
    expect(attendance.updatedAt.toISOString()).toBe(updatedAt.toISOString());
  });
});

describe("Attendance — valor opcional em centavos (amountCents)", () => {
  it("create preserva valor válido e normaliza ausente para nulo", () => {
    const withValue = Attendance.create({ ...validProps, amountCents: 15_000 });
    expect(withValue.amountCents).toBe(15_000);

    const zero = Attendance.create({ ...validProps, amountCents: 0 });
    expect(zero.amountCents).toBe(0);

    const without = Attendance.create(validProps);
    expect(without.amountCents).toBeNull();
  });

  it("o teto do valor no núcleo é o teto do contrato (nunca um literal duplicado)", () => {
    expect(MAX_ATTENDANCE_AMOUNT_CENTS).toBe(CONTRACT_MAX_AMOUNT_CENTS);
  });

  it("rejeita valor fracionário, negativo, acima do teto ou de tipo errado", () => {
    for (const amountCents of [
      1.5,
      -1,
      10_000_001,
      "15000",
      Number.NaN,
      Number.MAX_SAFE_INTEGER,
    ]) {
      expect(
        () =>
          Attendance.create({
            ...validProps,
            amountCents: amountCents as never,
          }),
        `valor hostil: ${String(amountCents)}`,
      ).toThrow(InvalidAttendance);
    }
  });

  it("restore valida valor corrompido vindo da persistência (só inteiro ou nulo)", () => {
    const base = {
      ...validProps,
      createdAt: new Date("2026-09-10T15:00:00.000Z"),
      updatedAt: new Date("2026-09-10T15:00:00.000Z"),
    };

    expect(
      Attendance.restore({ ...base, amountCents: null }).amountCents,
    ).toBeNull();
    expect(
      Attendance.restore({ ...base, amountCents: 15_000 }).amountCents,
    ).toBe(15_000);
    for (const amountCents of [1.5, -1, 10_000_001, "15000", Number.NaN]) {
      expect(
        () =>
          Attendance.restore({ ...base, amountCents: amountCents as never }),
        `valor hostil vindo do banco: ${String(amountCents)}`,
      ).toThrow(InvalidAttendance);
    }
  });

  it("não expõe setter de valor — imutabilidade estrutural", () => {
    const attendance = Attendance.create(validProps) as unknown as Record<
      string,
      unknown
    >;

    expect(attendance.setAmountCents).toBeUndefined();
    expect(attendance.updateAmountCents).toBeUndefined();
    expect(attendance.amountCents).toBeNull();
  });
});
