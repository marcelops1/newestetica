import { describe, expect, it } from "vitest";
import { Attendance } from "../entities/attendance.entity";
import { InMemoryAttendanceRepository } from "../../../../test/fakes/in-memory-attendance.repository";
import { InMemoryPatientDirectory } from "../../../../test/fakes/in-memory-patient-directory";

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

const ALFA = "00000000-0000-4000-8000-000000000101";
const BRAVO = "00000000-0000-4000-8000-000000000102";

describe("portas do Domain (atendimento)", () => {
  it("o fake manual cumpre AttendanceRepository: save persiste e lista por paciente", async () => {
    const repository = new InMemoryAttendanceRepository();
    const attendance = makeAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );

    await repository.save(attendance);

    const visible = await repository.findVisibleByPatient(ALFA, 100);
    expect(visible).toHaveLength(1);
    expect(visible[0]?.id).toBe(attendance.id);
    expect(visible[0]?.summary).toBe(attendance.summary);
  });

  it("findVisibleByPatient isola por paciente, ordena por data desc/id asc e respeita o limite", async () => {
    const repository = new InMemoryAttendanceRepository([
      makeAttendance(
        "00000000-0000-4000-8000-000000000203",
        ALFA,
        "2026-08-01T10:00:00.000Z",
      ),
      makeAttendance(
        "00000000-0000-4000-8000-000000000202",
        ALFA,
        "2026-09-10T14:30:00.000Z",
      ),
      makeAttendance(
        "00000000-0000-4000-8000-000000000201",
        ALFA,
        "2026-09-10T14:30:00.000Z",
      ),
      makeAttendance(
        "00000000-0000-4000-8000-000000000204",
        BRAVO,
        "2026-09-11T09:00:00.000Z",
      ),
    ]);

    const visible = await repository.findVisibleByPatient(ALFA, 100);

    expect(visible.map((attendance) => attendance.id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
      "00000000-0000-4000-8000-000000000202",
      "00000000-0000-4000-8000-000000000203",
    ]);

    const limited = await repository.findVisibleByPatient(ALFA, 1);
    expect(limited.map((attendance) => attendance.id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
    ]);
  });

  it("findVisibleById exige o vínculo com a paciente (cruzado responde nulo)", async () => {
    const repository = new InMemoryAttendanceRepository([
      makeAttendance(
        "00000000-0000-4000-8000-000000000201",
        ALFA,
        "2026-09-10T14:30:00.000Z",
      ),
    ]);

    await expect(
      repository.findVisibleById(
        "00000000-0000-4000-8000-000000000201",
        ALFA,
      ),
    ).resolves.toMatchObject({ id: "00000000-0000-4000-8000-000000000201" });
    await expect(
      repository.findVisibleById(
        "00000000-0000-4000-8000-000000000201",
        BRAVO,
      ),
    ).resolves.toBeNull();
    await expect(
      repository.findVisibleById(
        "00000000-0000-4000-8000-000000000299",
        ALFA,
      ),
    ).resolves.toBeNull();
  });

  it("histórico de paciente invisível nunca sai da leitura (2ª camada de defesa do fake)", async () => {
    const repository = new InMemoryAttendanceRepository(
      [
        makeAttendance(
          "00000000-0000-4000-8000-000000000201",
          ALFA,
          "2026-09-10T14:30:00.000Z",
        ),
      ],
      new Set([ALFA]),
    );

    await expect(repository.findVisibleByPatient(ALFA, 100)).resolves.toEqual(
      [],
    );
    await expect(
      repository.findVisibleById(
        "00000000-0000-4000-8000-000000000201",
        ALFA,
      ),
    ).resolves.toBeNull();
  });

  it("PatientDirectory devolve só o vínculo visível e nulo para o resto", async () => {
    const directory = new InMemoryPatientDirectory([{ id: ALFA }]);

    await expect(directory.findVisiblePatient(ALFA)).resolves.toEqual({
      id: ALFA,
    });
    await expect(directory.findVisiblePatient(BRAVO)).resolves.toBeNull();
    await expect(
      directory.findVisiblePatient("00000000-0000-4000-8000-000000000999"),
    ).resolves.toBeNull();
  });
});
