import { describe, expect, it } from "vitest";
import { Booking } from "./booking.entity";
import { Slot } from "./slot.entity";
import { InvalidBooking } from "../errors";

describe("Booking (entidade de domínio)", () => {
  it("cria booking pendente vinculada a um slot com os dados da paciente", () => {
    const booking = Booking.create({
      id: "booking-1",
      slotId: "slot-1",
      patientName: "Maria Exemplo",
      patientPhone: "(11) 98765-4321",
      treatment: "Limpeza de pele",
      notes: "Primeira visita",
    });

    expect(booking.id).toBe("booking-1");
    expect(booking.slotId).toBe("slot-1");
    expect(booking.patientName).toBe("Maria Exemplo");
    expect(booking.patientPhone).toBe("(11) 98765-4321");
    expect(booking.treatment).toBe("Limpeza de pele");
    expect(booking.notes).toBe("Primeira visita");
    expect(booking.status).toBe("pending");
  });

  it("aceita booking sem os campos opcionais", () => {
    const booking = Booking.create({
      id: "booking-1",
      slotId: "slot-1",
      patientName: "Maria Exemplo",
      patientPhone: "11999999999",
    });

    expect(booking.treatment).toBeUndefined();
    expect(booking.notes).toBeUndefined();
    expect(booking.status).toBe("pending");
  });

  it("confirma booking pendente e marca o slot como ocupado", () => {
    const slot = Slot.create({
      id: "slot-1",
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
    });
    const booking = Booking.create({
      id: "booking-1",
      slotId: slot.id,
      patientName: "Maria Exemplo",
      patientPhone: "(11) 98765-4321",
    });

    booking.confirm(slot);

    expect(booking.status).toBe("confirmed");
    expect(slot.available).toBe(false);
  });

  it("rejeita booking sem id, slot, nome ou telefone", () => {
    const base = {
      id: "booking-1",
      slotId: "slot-1",
      patientName: "Maria Exemplo",
      patientPhone: "11999999999",
    };

    expect(() => Booking.create({ ...base, id: "" })).toThrow(InvalidBooking);
    expect(() => Booking.create({ ...base, slotId: "" })).toThrow(
      InvalidBooking,
    );
    expect(() => Booking.create({ ...base, patientName: "   " })).toThrow(
      InvalidBooking,
    );
    expect(() => Booking.create({ ...base, patientPhone: "" })).toThrow(
      InvalidBooking,
    );
  });

  it.each(["id", "slotId", "patientPhone"] as const)(
    "rejeita %s só com espaços em branco (trim antes da validação)",
    (field) => {
      const base = {
        id: "booking-1",
        slotId: "slot-1",
        patientName: "Maria Exemplo",
        patientPhone: "11999999999",
      };

      expect(() => Booking.create({ ...base, [field]: "   " })).toThrow(
        InvalidBooking,
      );
    },
  );

  it("rejeita confirmar booking já confirmada", () => {
    const slot = Slot.create({
      id: "slot-1",
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
    });
    const booking = Booking.create({
      id: "booking-1",
      slotId: slot.id,
      patientName: "Maria Exemplo",
      patientPhone: "11999999999",
    });

    booking.confirm(slot);

    expect(() => booking.confirm(slot)).toThrow(InvalidBooking);
  });
});
