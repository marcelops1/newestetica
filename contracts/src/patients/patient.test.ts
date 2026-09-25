import { describe, expect, it } from "vitest";
import {
  PatientInputSchema,
  PatientSchema,
  PatientStatusSchema,
  PatientUpdateSchema,
} from "./patient";

const validInput = {
  fullName: "Paciente Fictícia Um",
  phone: "(11) 5555-0001",
  purpose: "Cadastro para acompanhamento na clínica",
};

const validPatient = {
  id: "00000000-0000-4000-8000-000000000001",
  fullName: "Paciente Fictícia Um",
  phone: "(11) 5555-0001",
  purpose: "Cadastro para acompanhamento na clínica",
  status: "active",
  createdAt: "2026-09-24T10:00:00.000Z",
  updatedAt: "2026-09-24T10:00:00.000Z",
};

describe("contrato de Pacientes (cadastro mínimo + saída)", () => {
  it("aceita cadastro mínimo válido e normaliza o nome com trim", () => {
    const result = PatientInputSchema.safeParse({
      ...validInput,
      fullName: "  Paciente Fictícia Um  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe("Paciente Fictícia Um");
    }
  });

  it("rejeita nome curto, telefone sem DDD e finalidade ausente ou vazia", () => {
    expect(
      PatientInputSchema.safeParse({ ...validInput, fullName: " A " }).success,
    ).toBe(false);
    expect(
      PatientInputSchema.safeParse({ ...validInput, phone: "(11) 1234" })
        .success,
    ).toBe(false);
    const withoutPurpose: Record<string, unknown> = { ...validInput };
    delete withoutPurpose.purpose;
    expect(PatientInputSchema.safeParse(withoutPurpose).success).toBe(false);
    expect(
      PatientInputSchema.safeParse({ ...validInput, purpose: "   " }).success,
    ).toBe(false);
  });

  it("ignora sem efeito campos fora de nome/telefone/finalidade (sem over-collection)", () => {
    const result = PatientInputSchema.safeParse({
      ...validInput,
      email: "ficticia@exemplo.invalid",
      healthNotes: "dado clínico que não deve entrar",
      status: "anonymized",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data).sort()).toEqual([
        "fullName",
        "phone",
        "purpose",
      ]);
    }
  });

  it("PatientUpdate aceita subconjunto parcial e neutraliza status/id/timestamps", () => {
    const partial = PatientUpdateSchema.safeParse({
      phone: "(11) 5555-0002",
      status: "anonymized",
      id: "00000000-0000-4000-8000-000000000002",
      updatedAt: "1999-01-01T00:00:00.000Z",
    });

    expect(partial.success).toBe(true);
    if (partial.success) {
      expect(Object.keys(partial.data)).toEqual(["phone"]);
      expect(partial.data.phone).toBe("(11) 5555-0002");
    }
  });

  it("Patient exige id/timestamps/status e rejeita status fora do vocabulário", () => {
    expect(PatientSchema.safeParse(validPatient).success).toBe(true);
    expect(
      PatientSchema.safeParse({ ...validPatient, status: "arquivada" }).success,
    ).toBe(false);
    const withoutId: Record<string, unknown> = { ...validPatient };
    delete withoutId.id;
    expect(PatientSchema.safeParse(withoutId).success).toBe(false);
    const withoutCreatedAt: Record<string, unknown> = { ...validPatient };
    delete withoutCreatedAt.createdAt;
    expect(PatientSchema.safeParse(withoutCreatedAt).success).toBe(false);
    expect(PatientStatusSchema.options).toEqual(["active", "anonymized"]);
  });

  it("rejeita nome ou telefone fora dos limites de tamanho", () => {
    expect(
      PatientInputSchema.safeParse({ ...validInput, fullName: "x".repeat(121) })
        .success,
    ).toBe(false);
    expect(
      PatientInputSchema.safeParse({ ...validInput, phone: "(11) 5555-000" })
        .success,
    ).toBe(false);
    expect(
      PatientInputSchema.safeParse({ ...validInput, phone: "9".repeat(21) })
        .success,
    ).toBe(false);
  });
});
