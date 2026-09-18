import { describe, expect, it } from "vitest";
import { FOOTER_NAV_ITEMS } from "../footer-nav-items";

function hrefFor(label: string) {
  return FOOTER_NAV_ITEMS.find((item) => item.label === label)?.href;
}

describe("destinos da navegação do rodapé", () => {
  it("leva Tratamentos para a página completa /tratamentos", () => {
    expect(hrefFor("Tratamentos")).toBe("/tratamentos");
  });

  it("leva Resultados para a página completa /antes-depois", () => {
    expect(hrefFor("Resultados")).toBe("/antes-depois");
  });

  it("leva Depoimentos para a página completa /depoimentos", () => {
    expect(hrefFor("Depoimentos")).toBe("/depoimentos");
  });

  it("mantém Diferenciais como âncora da home", () => {
    expect(hrefFor("Diferenciais")).toBe("/#diferenciais");
  });

  it("não usa âncoras cruas — todo destino parte da raiz", () => {
    expect(FOOTER_NAV_ITEMS.every((item) => item.href.startsWith("/"))).toBe(
      true,
    );
  });
});
