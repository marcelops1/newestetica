import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "../nav-items";
import { hrefFor } from "./test-helpers";

describe("destinos do menu principal", () => {
  it("leva Resultados para a página completa /antes-depois", () => {
    expect(hrefFor(NAV_ITEMS, "Resultados")).toBe("/antes-depois");
  });

  it("leva Depoimentos para a página completa /depoimentos", () => {
    expect(hrefFor(NAV_ITEMS, "Depoimentos")).toBe("/depoimentos");
  });

  it("mantém Diferenciais como âncora da home", () => {
    expect(hrefFor(NAV_ITEMS, "Diferenciais")).toBe("/#diferenciais");
  });

  it("mantém Tratamentos e A Clínica nas rotas reais já corrigidas", () => {
    expect(hrefFor(NAV_ITEMS, "Tratamentos")).toBe("/tratamentos");
    expect(hrefFor(NAV_ITEMS, "A Clínica")).toBe("/sobre");
  });
});
