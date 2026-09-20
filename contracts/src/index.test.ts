import { describe, expect, it } from "vitest";
import * as contracts from "@newestetica/contracts";

describe("ponto de entrada do pacote de contratos", () => {
  it("resolve o pacote do workspace", () => {
    expect(contracts).toBeTypeOf("object");
  });
});
