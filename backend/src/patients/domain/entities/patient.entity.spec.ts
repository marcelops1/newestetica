import { describe, expect, it } from "vitest";
import { InvalidPatient } from "../errors/errors";
import {
  ANONYMIZED_NAME,
  ANONYMIZED_PHONE,
  ANONYMIZED_PURPOSE,
  Patient,
} from "./patient.entity";

const base = {
  id: "00000000-0000-4000-8000-000000000001",
  fullName: "Paciente Fictícia Um",
  phone: "(11) 5555-0001",
  purpose: "Cadastro para acompanhamento na clínica",
};

describe("Patient (entidade de domínio)", () => {
  it("cria paciente válido e nasce ativo com timestamps e sem anonimização", () => {
    const before = Date.now();
    const patient = Patient.create(base);

    expect(patient.id).toBe(base.id);
    expect(patient.fullName).toBe("Paciente Fictícia Um");
    expect(patient.phone).toBe("(11) 5555-0001");
    expect(patient.purpose).toContain("acompanhamento");
    expect(patient.status).toBe("active");
    expect(patient.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(patient.updatedAt.getTime()).toBe(patient.createdAt.getTime());
    expect(patient.anonymizedAt).toBeNull();
  });

  it("rejeita id vazio, nome curto, telefone sem DDD e finalidade vazia", () => {
    expect(() => Patient.create({ ...base, id: "   " })).toThrow(
      InvalidPatient,
    );
    expect(() => Patient.create({ ...base, fullName: " A " })).toThrow(
      InvalidPatient,
    );
    expect(() => Patient.create({ ...base, phone: "(11) 1234" })).toThrow(
      InvalidPatient,
    );
    expect(() => Patient.create({ ...base, purpose: "   " })).toThrow(
      InvalidPatient,
    );
  });

  it("rejeita nome/telefone/finalidade acima dos limites", () => {
    expect(() =>
      Patient.create({ ...base, fullName: "x".repeat(121) }),
    ).toThrow(InvalidPatient);
    expect(() => Patient.create({ ...base, phone: "9".repeat(21) })).toThrow(
      InvalidPatient,
    );
    expect(() => Patient.create({ ...base, purpose: "x".repeat(201) })).toThrow(
      InvalidPatient,
    );
  });

  it("aceita as bordas exatas (nome 2/120, telefone 20, finalidade 1/200)", () => {
    const phone20 = "(11) 55555-5555-5555";
    expect(phone20).toHaveLength(20);

    expect(Patient.create({ ...base, fullName: "Ab" }).fullName).toBe("Ab");
    expect(
      Patient.create({ ...base, fullName: "x".repeat(120) }).fullName,
    ).toHaveLength(120);
    expect(Patient.create({ ...base, phone: phone20 }).phone).toBe(phone20);
    expect(Patient.create({ ...base, purpose: "x" }).purpose).toBe("x");
    expect(
      Patient.create({ ...base, purpose: "x".repeat(200) }).purpose,
    ).toHaveLength(200);
  });

  it("update aplica somente os campos informados e avança updatedAt", async () => {
    const patient = Patient.create(base);
    const createdAt = patient.createdAt.getTime();
    await new Promise((resolve) => setTimeout(resolve, 2));

    patient.update({ phone: "(11) 5555-0002" });

    expect(patient.phone).toBe("(11) 5555-0002");
    expect(patient.fullName).toBe(base.fullName);
    expect(patient.purpose).toBe(base.purpose);
    expect(patient.status).toBe("active");
    expect(patient.updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt);
  });

  it("update aplica nome e finalidade além do telefone", () => {
    const patient = Patient.create(base);

    patient.update({
      fullName: "Paciente Fictícia Atualizada",
      purpose: "Nova finalidade registrada",
    });

    expect(patient.fullName).toBe("Paciente Fictícia Atualizada");
    expect(patient.purpose).toBe("Nova finalidade registrada");
    expect(patient.phone).toBe(base.phone);
  });

  it("update de paciente anonimizada é rejeitado", () => {
    const patient = Patient.create(base);
    patient.anonymize();

    expect(() => patient.update({ phone: "(11) 5555-0003" })).toThrow(
      InvalidPatient,
    );
  });

  it("anonymize substitui a PII por placeholders fixos e carimba status/timestamp", () => {
    const patient = Patient.create(base);

    patient.anonymize();

    expect(patient.fullName).toBe(ANONYMIZED_NAME);
    expect(patient.phone).toBe(ANONYMIZED_PHONE);
    expect(patient.purpose).toBe(ANONYMIZED_PURPOSE);
    expect(patient.status).toBe("anonymized");
    expect(patient.anonymizedAt).toBeInstanceOf(Date);
    expect(patient.fullName).not.toContain("Fictícia");
    expect(patient.phone).not.toContain("5555");
    expect(patient.purpose).not.toContain("acompanhamento");
  });

  it("anonymize de paciente já anonimizada é rejeitada", () => {
    const patient = Patient.create(base);
    patient.anonymize();

    expect(() => patient.anonymize()).toThrow(InvalidPatient);
  });

  it("restore preserva o snapshot e também valida (defesa na entrada do banco)", () => {
    const snapshot = {
      ...base,
      status: "active" as const,
      createdAt: new Date("2026-09-01T10:00:00.000Z"),
      updatedAt: new Date("2026-09-02T10:00:00.000Z"),
      anonymizedAt: null,
    };
    const patient = Patient.restore({
      ...snapshot,
      status: "anonymized",
      anonymizedAt: new Date("2026-09-02T10:00:00.000Z"),
    });

    expect(patient.status).toBe("anonymized");
    expect(patient.anonymizedAt?.toISOString()).toBe(
      "2026-09-02T10:00:00.000Z",
    );
    expect(() =>
      Patient.restore({ ...snapshot, status: "arquivada" as never }),
    ).toThrow(InvalidPatient);
    expect(() => Patient.restore({ ...snapshot, fullName: "  " })).toThrow(
      InvalidPatient,
    );
  });
});
