import { afterEach, describe, expect, it, vi } from "vitest";
import { ConsoleNotificationAdapter } from "./console-notification.adapter";

describe("ConsoleNotificationAdapter (dev, sem SMTP)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registra a confirmação com dados operacionais sem vazar dados pessoais", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const adapter = new ConsoleNotificationAdapter();

    await adapter.sendBookingConfirmation({
      bookingId: "booking-1",
      patientName: "Maria Exemplo",
      patientPhone: "(11) 98765-4321",
      treatment: "Limpeza de pele",
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
    });

    expect(log).toHaveBeenCalledTimes(1);
    const message = String(log.mock.calls[0]?.[0]);
    expect(message).toContain("booking-1");
    expect(message).toContain("2026-10-01T13:00:00.000Z");
    expect(message).toContain("Limpeza de pele");
    expect(message).not.toContain("Maria Exemplo");
    expect(message).not.toContain("98765");
  });

  it("registra a confirmação sem tratamento, sem sufixo vazio", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const adapter = new ConsoleNotificationAdapter();

    await adapter.sendBookingConfirmation({
      bookingId: "booking-2",
      patientName: "Maria Exemplo",
      patientPhone: "11999999999",
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
    });

    expect(log).toHaveBeenCalledTimes(1);
    const message = String(log.mock.calls[0]?.[0]);
    expect(message).toContain("booking-2");
    expect(message).toContain("60 min)");
    expect(message).not.toContain(" · ");
    expect(message).not.toContain("Maria Exemplo");
  });
});
