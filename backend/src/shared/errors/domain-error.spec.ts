import { describe, expect, it } from "vitest";
import { DomainError } from "./domain-error";

class SampleError extends DomainError<"SAMPLE_CODE"> {
  constructor(reason: string) {
    super("SAMPLE_CODE", `Exemplo: ${reason}`);
  }
}

describe("DomainError (base genérica compartilhada)", () => {
  it("preserva código de domínio arbitrário e a mensagem", () => {
    const error = new SampleError("motivo fictício");

    expect(error.code).toBe("SAMPLE_CODE");
    expect(error.message).toBe("Exemplo: motivo fictício");
  });

  it("name é o da subclasse concreta (não 'DomainError')", () => {
    const error = new SampleError("qualquer");

    expect(error.name).toBe("SampleError");
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });
});
