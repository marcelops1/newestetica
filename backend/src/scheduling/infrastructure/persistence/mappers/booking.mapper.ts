import type { Booking as BookingRecord } from "../../../../generated/prisma/client";
import {
  Booking,
  type BookingStatus,
} from "../../../domain/entities/booking.entity";
import { InvalidBooking } from "../../../domain/errors";

function toStatus(value: string): BookingStatus {
  if (value === "pending" || value === "confirmed") {
    return value;
  }
  throw new InvalidBooking(`status desconhecido vindo do banco: ${value}`);
}

export function toBookingDomain(record: BookingRecord): Booking {
  return Booking.restore({
    id: record.id,
    slotId: record.slotId,
    patientName: record.patientName,
    patientPhone: record.patientPhone,
    ...(record.treatment !== null ? { treatment: record.treatment } : {}),
    ...(record.notes !== null ? { notes: record.notes } : {}),
    status: toStatus(record.status),
  });
}

export function toBookingPersistence(booking: Booking) {
  return {
    id: booking.id,
    slotId: booking.slotId,
    patientName: booking.patientName,
    patientPhone: booking.patientPhone,
    treatment: booking.treatment ?? null,
    notes: booking.notes ?? null,
    status: booking.status,
  };
}
