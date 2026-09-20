import { describe, expect, it } from "vitest";
import * as contracts from "./index";

describe("ponto de entrada do pacote de contratos", () => {
  it("carrega o barrel raiz do pacote", () => {
    expect(contracts).toBeTypeOf("object");
  });
});
