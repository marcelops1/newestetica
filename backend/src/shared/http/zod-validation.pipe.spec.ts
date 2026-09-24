import { UnprocessableEntityException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ZodValidationPipe } from "./zod-validation.pipe";

const Schema = z.object({ amount: z.number() });

describe("ZodValidationPipe (kernel técnico compartilhado)", () => {
  it("aprova entrada válida e devolve o valor validado", () => {
    const pipe = new ZodValidationPipe(Schema);

    expect(pipe.transform({ amount: 42 })).toEqual({ amount: 42 });
  });

  it("reprova entrada inválida com o formato único de erro (422, sem detalhe interno)", () => {
    const pipe = new ZodValidationPipe(Schema);

    let captured: unknown;
    try {
      pipe.transform({ amount: "quarenta-e-dois" });
    } catch (error) {
      captured = error;
    }

    expect(captured).toBeInstanceOf(UnprocessableEntityException);
    const body = (captured as UnprocessableEntityException).getResponse();
    expect(body).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Confira os dados e tente de novo — sem pressa.",
      fields: { amount: "Valor inválido." },
    });
  });
});
