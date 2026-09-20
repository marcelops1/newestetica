import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toValidationError, VALIDATION_ERROR_CODE } from "./errors";

const schema = z.object({ name: z.string().min(1), phone: z.string().min(1) });

describe("erro de validação normalizado", () => {
  it("payload malformado vira erro estruturado com código, mensagem e campos", () => {
    const result = schema.safeParse({ name: "", phone: 42 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = toValidationError(result.error);
      expect(error.code).toBe(VALIDATION_ERROR_CODE);
      expect(error.message.length).toBeGreaterThan(0);
      expect(error.fields).toEqual({
        name: expect.any(String),
        phone: expect.any(String),
      });
    }
  });

  it("não vaza detalhes internos do validador (sem stack, tipos ou ZodError)", () => {
    const result = schema.safeParse({ name: "Maria", phone: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = toValidationError(result.error);
      const serialized = JSON.stringify(error);
      expect(serialized).not.toMatch(/zod|ZodError|stack|expected string/i);
    }
  });

  it("payload sem campos identificáveis omite o mapa de campos", () => {
    const result = schema.safeParse(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toValidationError(result.error).fields).toBeUndefined();
    }
  });

  it("mensagem é acolhedora e reaproveitável pela UI", () => {
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toValidationError(result.error).message).toContain("sem pressa");
    }
  });
});
