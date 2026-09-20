import { Body, Controller, Get, Param, Post, UseFilters } from "@nestjs/common";
import { BookingInputSchema, type BookingInput } from "@newestetica/contracts";
import { CreateBookingUseCase } from "../../application/use-cases/create-booking.use-case";
import { ListAvailabilityUseCase } from "../../application/use-cases/list-availability.use-case";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

type AvailabilityResponse = {
  id: string;
  start: string;
  durationMinutes: number;
  available: boolean;
};

type BookingResponse = {
  id: string;
  status: string;
  treatment?: string;
  slot: AvailabilityResponse;
};

@Controller()
@UseFilters(DomainExceptionFilter)
export class SchedulingController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly listAvailability: ListAvailabilityUseCase,
  ) {}

  @Get("slots/available")
  async available(): Promise<AvailabilityResponse[]> {
    const slots = await this.listAvailability.execute();
    return slots.map((slot) => ({
      id: slot.id,
      start: slot.start.toISOString(),
      durationMinutes: slot.durationMinutes,
      available: slot.available,
    }));
  }

  @Post("slots/:slotId/bookings")
  async book(
    @Param("slotId") slotId: string,
    @Body(new ZodValidationPipe(BookingInputSchema)) input: BookingInput,
  ): Promise<BookingResponse> {
    const { booking, slot } = await this.createBooking.execute({
      slotId,
      name: input.name,
      phone: input.phone,
      ...(input.treatment !== undefined ? { treatment: input.treatment } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });
    return {
      id: booking.id,
      status: booking.status,
      ...(booking.treatment !== undefined
        ? { treatment: booking.treatment }
        : {}),
      slot: {
        id: slot.id,
        start: slot.start.toISOString(),
        durationMinutes: slot.durationMinutes,
        available: slot.available,
      },
    };
  }
}
