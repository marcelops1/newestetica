export type BookingConfirmation = {
  bookingId: string;
  patientName: string;
  patientPhone: string;
  treatment?: string;
  start: Date;
  durationMinutes: number;
};

export interface NotificationPort {
  sendBookingConfirmation(confirmation: BookingConfirmation): Promise<void>;
}
