import { describe, expect, it } from "vitest";
import { FOOTER_NAV_ITEMS } from "../footer-nav-items";
import { hrefFor } from "./test-helpers";

describe("navegação do rodapé", () => {
  it("lista os seis itens do rodapé na ordem própria do rodapé", () => {
    expect(FOOTER_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Tratamentos",
      "Resultados",
      "Depoimentos",
      "Diferenciais",
      "Blog",
      "Contato",
    ]);
  });

  it("não inclui A Clínica (o rodapé não tem item Sobre)", () => {
    expect(hrefFor(FOOTER_NAV_ITEMS, "A Clínica")).toBeUndefined();
    expect(FOOTER_NAV_ITEMS.some((item) => item.href === "/sobre")).toBe(false);
  });
});
