import { describe, expect, it } from "vitest";
import { postsMock } from "../../../frontend/lib/mocks/schedule";
import { PostSchema } from "./post";

describe("contrato de Post (blog)", () => {
  it("todo post mockado do frontend é compatível", () => {
    for (const item of postsMock) {
      const result = PostSchema.safeParse(item);
      expect(result.success, `post mockado ${item.id}`).toBe(true);
    }
  });

  it("rejeita conteúdo vazio, parágrafo vazio e categoria vazia", () => {
    expect(PostSchema.safeParse({ ...postsMock[0], content: [] }).success).toBe(
      false,
    );
    expect(
      PostSchema.safeParse({ ...postsMock[0], content: ["", "Parágrafo."] })
        .success,
    ).toBe(false);
    expect(PostSchema.safeParse({ ...postsMock[0], category: "" }).success).toBe(
      false,
    );
  });

  it("rejeita data de publicação fora do formato ISO (AAAA-MM-DD)", () => {
    expect(
      PostSchema.safeParse({ ...postsMock[0], publishedAt: "20/08/2026" })
        .success,
    ).toBe(false);
  });
});
