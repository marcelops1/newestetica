import { HttpStatus, type ArgumentsHost } from "@nestjs/common";
import { describe, expect, it, vi, type Mock } from "vitest";
import { DomainError } from "../errors/domain-error";
import { DomainExceptionFilter } from "./domain-exception.filter";

class TestError extends DomainError<"TEST_CODE"> {
  constructor() {
    super("TEST_CODE", "Erro fictício.");
  }
}

class MappedTestFilter extends DomainExceptionFilter {
  protected statusFor(error: DomainError<string>): number {
    if (error instanceof TestError) {
      return HttpStatus.NOT_FOUND;
    }
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}

class DefaultTestFilter extends DomainExceptionFilter {}

function makeHost(): {
  host: ArgumentsHost;
  status: Mock;
  json: Mock;
} {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe("DomainExceptionFilter (base compartilhada)", () => {
  it("usa o mapa da subclasse quando o erro é mapeado", () => {
    const filter = new MappedTestFilter();
    const { host, status, json } = makeHost();

    filter.catch(new TestError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      code: "TEST_CODE",
      message: "Erro fictício.",
    });
  });

  it("default do hook é 422 e o corpo tem só code/message (sem stack)", () => {
    const filter = new DefaultTestFilter();
    const { host, status, json } = makeHost();

    filter.catch(new TestError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    const body = json.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(["code", "message"]);
    expect(JSON.stringify(body)).not.toContain("stack");
  });
});
