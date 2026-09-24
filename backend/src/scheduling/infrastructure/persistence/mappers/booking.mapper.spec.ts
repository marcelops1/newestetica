import { describe, expect, it } from "vitest";
import { InvalidBooking } from "../../../domain/errors/errors";
import { toBookingDomain, toBookingPersistence } from "./booking.mapper";

function makeRecord() {
  return {
    id: "booking-1",
    slotId: "slot-1",
    patientName: "Maria Exemplo",
    patientPhone: "(11) 98765-4321",
    treatment: "Limpeza de pele",
    notes: null,
    status: "confirmed",
  };
}

describe("booking.mapper (Data Mapper Prisma ↔ domínio)", () => {
  it("mapeia registro do banco para a entidade de domínio", () => {
    const booking = toBookingDomain(makeRecord());

    expect(booking.id).toBe("booking-1");
    expect(booking.slotId).toBe("slot-1");
    expect(booking.patientName).toBe("Maria Exemplo");
    expect(booking.treatment).toBe("Limpeza de pele");
    expect(booking.notes).toBeUndefined();
    expect(booking.status).toBe("confirmed");
  });

  it("rejeita status desconhecido vindo do banco", () => {
    expect(() =>
      toBookingDomain({ ...makeRecord(), status: "cancelada" }),
    ).toThrow(InvalidBooking);
  });

  it("mapeia entidade para o formato de persistência (undefined vira null)", () => {
    const booking = toBookingDomain({ ...makeRecord(), notes: null });
    const data = toBookingPersistence(booking);

    expect(data).toEqual({
      id: "booking-1",
      slotId: "slot-1",
      patientName: "Maria Exemplo",
      patientPhone: "(11) 98765-4321",
      treatment: "Limpeza de pele",
      notes: null,
      status: "confirmed",
    });
  });
});
