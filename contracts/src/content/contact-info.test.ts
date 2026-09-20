import { describe, expect, it } from "vitest";
import { contactMock } from "../../../frontend/lib/mocks/quiz";
import { ContactInfoSchema } from "./contact-info";

describe("contrato de ContactInfo (informações institucionais fictícias)", () => {
  it("as informações institucionais do mock são compatíveis", () => {
    const result = ContactInfoSchema.safeParse(contactMock);
    expect(result.success).toBe(true);
  });

  it("rejeita horários ou endereço vazios", () => {
    expect(ContactInfoSchema.safeParse({ ...contactMock, hours: [] }).success).toBe(
      false,
    );
    expect(
      ContactInfoSchema.safeParse({ ...contactMock, address: [] }).success,
    ).toBe(false);
  });

  it("rejeita link de WhatsApp que não é URL", () => {
    expect(
      ContactInfoSchema.safeParse({ ...contactMock, whatsappHref: "não-é-url" })
        .success,
    ).toBe(false);
  });
});
