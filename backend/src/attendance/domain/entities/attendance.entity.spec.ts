import { describe, expect, it } from "vitest";
import { Attendance } from "./attendance.entity";
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

  it("aceita resumo com exatamente 500 caracteres", () => {
    const attendance = Attendance.create({
      ...validProps,
      summary: "x".repeat(500),
    });

    expect(attendance.summary).toHaveLength(500);
  });

  it("rejeita id vazio, paciente vazia, resumo vazio ou acima de 500 e data inválida", () => {
    expect(() => Attendance.create({ ...validProps, id: "  " })).toThrow(
      InvalidAttendance,
    );
    expect(() =>
      Attendance.create({ ...validProps, patientId: "  " }),
    ).toThrow(InvalidAttendance);
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
      summary: "   ",
      createdAt: new Date("2026-09-10T15:00:00.000Z"),
      updatedAt: new Date("2026-09-10T15:00:00.000Z"),
    };

    expect(() => Attendance.restore(snapshot)).toThrow(InvalidAttendance);
  });

  it("restore preserva os timestamps originais da persistência", () => {
    const createdAt = new Date("2026-09-10T15:00:00.000Z");
    const updatedAt = new Date("2026-09-11T09:00:00.000Z");

    const attendance = Attendance.restore({
      ...validProps,
      createdAt,
      updatedAt,
    });

    expect(attendance.createdAt.toISOString()).toBe(createdAt.toISOString());
    expect(attendance.updatedAt.toISOString()).toBe(updatedAt.toISOString());
  });
});
