import { describe, expect, it } from "vitest";
import { NAV_DESTINATIONS, NAV_ITEMS } from "../nav-items";
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

describe("destinos das páginas antes sem acesso", () => {
  it("aponta Blog para /blog", () => {
    expect(NAV_DESTINATIONS.blog).toBe("/blog");
  });

  it("aponta Contato para /contato", () => {
    expect(NAV_DESTINATIONS.contato).toBe("/contato");
  });

  it("aponta Orçamento para /orcamento", () => {
    expect(NAV_DESTINATIONS.orcamento).toBe("/orcamento");
  });
});
