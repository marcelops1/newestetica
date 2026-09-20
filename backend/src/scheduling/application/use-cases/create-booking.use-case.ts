import { randomUUID } from "node:crypto";
import { Booking } from "../../domain/entities/booking.entity";
import { SlotAlreadyBooked, SlotNotFound } from "../../domain/errors";
import type { BookingRepository } from "../../domain/ports/booking.repository";
import type { NotificationPort } from "../../domain/ports/notification.port";
import type { SlotRepository } from "../../domain/ports/slot.repository";
import type { UnitOfWork } from "../../domain/ports/unit-of-work.port";

export type CreateBookingInput = {
  slotId: string;
  name: string;
  phone: string;
  treatment?: string;
  notes?: string;
};

export class CreateBookingUseCase {
  constructor(
    private readonly slots: SlotRepository,
    private readonly bookings: BookingRepository,
    private readonly notifications: NotificationPort,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    const slot = await this.slots.findById(input.slotId);
    if (!slot) {
      throw new SlotNotFound(input.slotId);
    }
    if (!slot.available) {
      throw new SlotAlreadyBooked(slot.id);
    }

    const booking = Booking.create({
      id: randomUUID(),
      slotId: input.slotId,
      patientName: input.name,
      patientPhone: input.phone,
      ...(input.treatment !== undefined ? { treatment: input.treatment } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });
    booking.confirm(slot);

    await this.unitOfWork.execute(async () => {
      await this.bookings.save(booking);
      await this.slots.save(slot);
    });

    await this.notifications.sendBookingConfirmation({
      bookingId: booking.id,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      ...(booking.treatment !== undefined
        ? { treatment: booking.treatment }
        : {}),
      start: slot.start,
      durationMinutes: slot.durationMinutes,
    });

    return booking;
  }
}
