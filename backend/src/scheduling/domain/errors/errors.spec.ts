import { describe, expect, it } from "vitest";
import {
  InvalidBooking,
  InvalidSlot,
  SlotAlreadyBooked,
  SlotNotFound,
} from "./errors";

describe("códigos estáveis dos erros de domínio (contrato da API)", () => {
  it.each([
    [new InvalidSlot("motivo"), "INVALID_SLOT"],
    [new InvalidBooking("motivo"), "INVALID_BOOKING"],
    [new SlotNotFound("slot-1"), "SLOT_NOT_FOUND"],
    [new SlotAlreadyBooked("slot-1"), "SLOT_ALREADY_BOOKED"],
  ])("expõe code e mensagem não-vazia para %s", (error, code) => {
    expect(error.code).toBe(code);
    expect(error.message.length).toBeGreaterThan(0);
    expect(error).toBeInstanceOf(Error);
  });
});
