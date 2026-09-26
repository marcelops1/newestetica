import { Body, Controller, Get, Param, Post, UseFilters } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import { BookingInputSchema, SlotSchema } from "@newestetica/contracts";
import { createZodDto } from "nestjs-zod";
import { CreateBookingUseCase } from "../../application/use-cases/create-booking.use-case";
import { ListAvailabilityUseCase } from "../../application/use-cases/list-availability.use-case";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";

/* DTO derivado do contrato (fonte única): só documentação — a validação continua no
   ZodValidationPipe, sem duplicar campo algum. */
class BookingInputDto extends createZodDto(BookingInputSchema) {}
class SlotResponseDto extends createZodDto(SlotSchema) {}

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

@ApiTags("Agendamento")
@Controller()
@UseFilters(DomainExceptionFilter)
export class SchedulingController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly listAvailability: ListAvailabilityUseCase,
  ) {}

  @Get("slots/available")
  @ApiOperation({ summary: "Lista os horários disponíveis para agendamento" })
  @ApiOkResponse({
    description: "Horários disponíveis de agora em diante.",
    type: SlotResponseDto,
    isArray: true,
  })
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
  @ApiOperation({ summary: "Solicita um agendamento em um horário disponível" })
  @ApiParam({
    name: "slotId",
    description: "Identificador do horário escolhido.",
  })
  @ApiCreatedResponse({ description: "Agendamento confirmado." })
  @ApiNotFoundResponse({ description: "Horário não encontrado." })
  @ApiConflictResponse({ description: "Horário já reservado." })
  @ApiUnprocessableEntityResponse({
    description: "Dados inválidos na solicitação.",
  })
  async book(
    @Param("slotId") slotId: string,
    @Body(new ZodValidationPipe(BookingInputSchema)) input: BookingInputDto,
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
