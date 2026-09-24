import {
  Booking,
  type BookingSnapshot,
} from "../../src/scheduling/domain/entities/booking.entity";
import type { BookingRepository } from "../../src/scheduling/domain/ports/booking.repository";
import { SlotAlreadyBooked } from "../../src/scheduling/domain/errors/errors";

export class InMemoryBookingRepository implements BookingRepository {
  private readonly bookings = new Map<string, BookingSnapshot>();

  async save(booking: Booking): Promise<void> {
    if (booking.status === "confirmed") {
      const conflicting = [...this.bookings.values()].some(
        (record) =>
          record.slotId === booking.slotId &&
          record.status === "confirmed" &&
          record.id !== booking.id,
      );
      if (conflicting) {
        throw new SlotAlreadyBooked(booking.slotId);
      }
    }
    this.bookings.set(booking.id, {
      id: booking.id,
      slotId: booking.slotId,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      ...(booking.treatment !== undefined
        ? { treatment: booking.treatment }
        : {}),
      ...(booking.notes !== undefined ? { notes: booking.notes } : {}),
      status: booking.status,
    });
  }

  all(): Booking[] {
    return [...this.bookings.values()].map((record) =>
      Booking.restore({ ...record }),
    );
  }

  snapshot(): BookingSnapshot[] {
    return [...this.bookings.values()].map((record) => ({ ...record }));
  }

  restore(snapshot: unknown): void {
    const records = snapshot as BookingSnapshot[];
    this.bookings.clear();
    for (const record of records) {
      this.bookings.set(record.id, { ...record });
    }
  }
}
