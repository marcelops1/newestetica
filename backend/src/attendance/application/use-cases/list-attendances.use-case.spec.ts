import { describe, expect, it } from "vitest";
import { InMemoryAttendanceRepository } from "../../../../test/fakes/in-memory-attendance.repository";
import { InMemoryPatientDirectory } from "../../../../test/fakes/in-memory-patient-directory";
import { Attendance } from "../../domain/entities/attendance.entity";
import { InvalidAttendance, PatientNotFound } from "../../domain/errors/errors";
import type { AttendanceRepository } from "../../domain/ports/attendance.repository";
import {
  DEFAULT_ATTENDANCES_LIMIT,
  ListAttendancesUseCase,
} from "./list-attendances.use-case";

const PATIENT_ID = "00000000-0000-4000-8000-000000000101";
const OTHER_PATIENT_ID = "00000000-0000-4000-8000-000000000102";

class SpyAttendanceRepository implements AttendanceRepository {
  lastLimit: number | null = null;
  listCalls = 0;

  constructor(private readonly inner: InMemoryAttendanceRepository) {}

  async save(attendance: Attendance): Promise<void> {
    return this.inner.save(attendance);
  }

  async findVisibleByPatient(
    patientId: string,
    limit: number,
  ): Promise<Attendance[]> {
    this.listCalls += 1;
    this.lastLimit = limit;
    return this.inner.findVisibleByPatient(patientId, limit);
  }

  async findVisibleById(
    id: string,
    patientId: string,
  ): Promise<Attendance | null> {
    return this.inner.findVisibleById(id, patientId);
  }
}

function makeAttendance(
  id: string,
  patientId: string,
  performedAt: string,
): Attendance {
  return Attendance.create({
    id,
    patientId,
    summary: `Atendimento fictício ${id}.`,
    performedAt: new Date(performedAt),
  });
}

function makeUseCase(): {
  useCase: ListAttendancesUseCase;
  spy: SpyAttendanceRepository;
} {
  const spy = new SpyAttendanceRepository(
    new InMemoryAttendanceRepository([
      makeAttendance(
        "00000000-0000-4000-8000-000000000203",
        PATIENT_ID,
        "2026-08-01T10:00:00.000Z",
      ),
      makeAttendance(
        "00000000-0000-4000-8000-000000000201",
        PATIENT_ID,
        "2026-09-10T14:30:00.000Z",
      ),
      makeAttendance(
        "00000000-0000-4000-8000-000000000204",
        OTHER_PATIENT_ID,
        "2026-09-11T09:00:00.000Z",
      ),
    ]),
  );
  const patients = new InMemoryPatientDirectory([
    { id: PATIENT_ID },
    { id: OTHER_PATIENT_ID },
  ]);
  return { useCase: new ListAttendancesUseCase(spy, patients), spy };
}

describe("ListAttendancesUseCase", () => {
  it("lista só o histórico da paciente consultada, mais recentes primeiro", async () => {
    const { useCase } = makeUseCase();

    const attendances = await useCase.execute({ patientId: PATIENT_ID });

    expect(attendances.map((attendance) => attendance.id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
      "00000000-0000-4000-8000-000000000203",
    ]);
  });

  it("usa o teto padrão quando o limite não é informado e repassa o informado", async () => {
    const { useCase, spy } = makeUseCase();

    await useCase.execute({ patientId: PATIENT_ID });
    expect(spy.lastLimit).toBe(DEFAULT_ATTENDANCES_LIMIT);

    const limited = await useCase.execute({ patientId: PATIENT_ID, limit: 1 });
    expect(spy.lastLimit).toBe(1);
    expect(limited).toHaveLength(1);
    expect(limited[0]?.id).toBe("00000000-0000-4000-8000-000000000201");
  });

  it("aceita o teto exato (500) e rejeita limite hostil no núcleo", async () => {
    const { useCase, spy } = makeUseCase();

    await useCase.execute({ patientId: PATIENT_ID, limit: 500 });
    expect(spy.lastLimit).toBe(500);

    for (const limit of [0, -1, 501, 10_000, 1.5, Number.NaN]) {
      await expect(
        useCase.execute({ patientId: PATIENT_ID, limit }),
        `limite hostil: ${limit}`,
      ).rejects.toThrow(InvalidAttendance);
    }
    expect(spy.listCalls).toBe(1);
  });

  it("paciente inexistente ou invisível responde não-encontrado sem tocar a lista", async () => {
    const attendances = new SpyAttendanceRepository(
      new InMemoryAttendanceRepository(),
    );
    const useCase = new ListAttendancesUseCase(
      attendances,
      new InMemoryPatientDirectory([]),
    );

    await expect(useCase.execute({ patientId: PATIENT_ID })).rejects.toThrow(
      PatientNotFound,
    );
    expect(attendances.listCalls).toBe(0);
  });

  it("sem registros responde lista vazia", async () => {
    const useCase = new ListAttendancesUseCase(
      new InMemoryAttendanceRepository(),
      new InMemoryPatientDirectory([{ id: PATIENT_ID }]),
    );

    await expect(useCase.execute({ patientId: PATIENT_ID })).resolves.toEqual(
      [],
    );
  });
});
