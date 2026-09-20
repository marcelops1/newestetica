import type {
  BookingConfirmation,
  NotificationPort,
} from "../../src/scheduling/domain/ports/notification.port";

export class FakeNotificationPort implements NotificationPort {
  readonly confirmations: BookingConfirmation[] = [];

  async sendBookingConfirmation(
    confirmation: BookingConfirmation,
  ): Promise<void> {
    this.confirmations.push(confirmation);
  }
}
