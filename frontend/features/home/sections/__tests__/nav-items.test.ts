import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "../nav-items";

function hrefFor(label: string) {
  return NAV_ITEMS.find((item) => item.label === label)?.href;
}

describe("destinos do menu principal", () => {
  it("leva Resultados para a página completa /antes-depois", () => {
    expect(hrefFor("Resultados")).toBe("/antes-depois");
  });

  it("leva Depoimentos para a página completa /depoimentos", () => {
    expect(hrefFor("Depoimentos")).toBe("/depoimentos");
  });

  it("mantém Diferenciais como âncora da home", () => {
    expect(hrefFor("Diferenciais")).toBe("/#diferenciais");
  });

  it("mantém Tratamentos e A Clínica nas rotas reais já corrigidas", () => {
    expect(hrefFor("Tratamentos")).toBe("/tratamentos");
    expect(hrefFor("A Clínica")).toBe("/sobre");
  });
});
