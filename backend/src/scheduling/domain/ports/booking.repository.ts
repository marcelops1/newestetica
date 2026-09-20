import type { Booking } from "../entities/booking.entity";

export interface BookingRepository {
  save(booking: Booking): Promise<void>;
}
