import type {
  BookingConfirmation,
  NotificationPort,
} from "../../domain/ports/notification.port";

export class ConsoleNotificationAdapter implements NotificationPort {
  async sendBookingConfirmation(
    confirmation: BookingConfirmation,
  ): Promise<void> {
    const treatment = confirmation.treatment
      ? ` · ${confirmation.treatment}`
      : "";
    console.log(
      `[agendamento] confirmação ${confirmation.bookingId}: ` +
        `${confirmation.start.toISOString()} (${confirmation.durationMinutes} min)${treatment}`,
    );
  }
}
