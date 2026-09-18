import { describe, expect, it } from "vitest";
import TratamentosNotFound from "../not-found";

describe("404 do catálogo de tratamentos", () => {
  it("exporta a página de não-encontrado como componente padrão", () => {
    expect(typeof TratamentosNotFound).toBe("function");
  });

  it("executa o corpo do componente e retorna um elemento de página", () => {
    const element = TratamentosNotFound();
    expect(element).toBeTruthy();
  });
});
