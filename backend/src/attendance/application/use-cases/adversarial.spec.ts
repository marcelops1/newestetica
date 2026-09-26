import { describe, expect, it } from "vitest";
import { InMemoryAttendanceRepository } from "../../../../test/fakes/in-memory-attendance.repository";
import { InMemoryPatientDirectory } from "../../../../test/fakes/in-memory-patient-directory";
import { Attendance } from "../../domain/entities/attendance.entity";
import {
  AttendanceNotFound,
  InvalidAttendance,
  PatientNotFound,
} from "../../domain/errors/errors";
import { CreateAttendanceUseCase } from "./create-attendance.use-case";
import { GetAttendanceByIdUseCase } from "./get-attendance-by-id.use-case";
import { ListAttendancesUseCase } from "./list-attendances.use-case";

/* Adversarial (docs/07 §16d): entradas hostis REAIS contra a superfície da aplicação,
   como defesa em profundidade — mesmo que a fronteira HTTP valide antes, o núcleo não
   confia no chamador. O resumo é dado opaco: nunca interpretado, sempre armazenado
   literal quando aceito. */

const PATIENT_ID = "00000000-0000-4000-8000-000000000101";
const OTHER_PATIENT_ID = "00000000-0000-4000-8000-000000000102";
const ATTENDANCE_ID = "00000000-0000-4000-8000-000000000201";

const validInput = {
  patientId: PATIENT_ID,
  summary: "Limpeza de pele realizada, sem intercorrências.",
  performedAt: "2026-09-10T14:30:00.000Z",
};

function makeUseCases(invisiblePatientIds: ReadonlySet<string> = new Set()): {
  create: CreateAttendanceUseCase;
  list: ListAttendancesUseCase;
  get: GetAttendanceByIdUseCase;
  attendances: InMemoryAttendanceRepository;
} {
  const attendances = new InMemoryAttendanceRepository(
    [
      Attendance.create({
        id: ATTENDANCE_ID,
        patientId: PATIENT_ID,
        summary: "Atendimento fictício.",
        performedAt: new Date("2026-09-10T14:30:00.000Z"),
      }),
    ],
    invisiblePatientIds,
  );
  const patients = new InMemoryPatientDirectory([
    { id: PATIENT_ID },
    { id: OTHER_PATIENT_ID },
  ]);
  return {
    create: new CreateAttendanceUseCase(attendances, patients),
    list: new ListAttendancesUseCase(attendances, patients),
    get: new GetAttendanceByIdUseCase(attendances, patients),
    attendances,
  };
}

describe("adversarial — entradas hostis contra os casos de uso", () => {
  it("resumo gigante, injeção e unicode/controle são tratados: gigante rejeitado, opaco preservado", async () => {
    const { create, attendances } = makeUseCases();

    await expect(
      create.execute({ ...validInput, summary: "x".repeat(10_000) }),
    ).rejects.toThrow(InvalidAttendance);

    const hostileSummary =
      "Sessão ' OR '1'='1; DROP TABLE \"Attendance\"; -- \u0000 é ótimo ✨";
    const created = await create.execute({
      ...validInput,
      summary: hostileSummary,
    });

    expect(created.summary).toBe(hostileSummary);
    const listed = await attendances.findVisibleByPatient(PATIENT_ID, 100);
    expect(listed.some((item) => item.summary === hostileSummary)).toBe(true);
  });

  it("paciente com id gigante/malformado responde não-encontrado sem criar nada", async () => {
    const { create } = makeUseCases();

    await expect(
      create.execute({ ...validInput, patientId: "x".repeat(100_000) }),
    ).rejects.toThrow(PatientNotFound);
    await expect(
      create.execute({ ...validInput, patientId: "" }),
    ).rejects.toThrow(PatientNotFound);
  });

  it("tipos confundidos (resumo/data não-string) são rejeitados como inválidos, sem TypeError", async () => {
    const { create } = makeUseCases();

    await expect(
      create.execute({ ...validInput, summary: null as never }),
    ).rejects.toThrow(InvalidAttendance);
    await expect(
      create.execute({ ...validInput, summary: 12_345 as never }),
    ).rejects.toThrow(InvalidAttendance);
    await expect(
      create.execute({ ...validInput, performedAt: null as never }),
    ).rejects.toThrow(InvalidAttendance);
    await expect(
      create.execute({ ...validInput, performedAt: 1_700_000_000_000 as never }),
    ).rejects.toThrow(InvalidAttendance);
    await expect(
      create.execute({ ...validInput, performedAt: "2026-13-45T99:99:99Z" }),
    ).rejects.toThrow(InvalidAttendance);
  });

  it("snapshot corrompido vindo da persistência não derruba o restore com TypeError", () => {
    const snapshot = {
      id: ATTENDANCE_ID,
      patientId: PATIENT_ID,
      summary: null as never,
      performedAt: new Date("2026-09-10T14:30:00.000Z"),
      createdAt: new Date("2026-09-10T15:00:00.000Z"),
      updatedAt: new Date("2026-09-10T15:00:00.000Z"),
    };

    expect(() => Attendance.restore(snapshot)).toThrow(InvalidAttendance);
    expect(() =>
      Attendance.restore({ ...snapshot, summary: "ok", performedAt: "não" as never }),
    ).toThrow(InvalidAttendance);
  });

  it("limite hostil é rejeitado no núcleo; teto exato é aceito", async () => {
    const { list } = makeUseCases();

    for (const limit of [0, -1, 501, 10_000, 1.5, Number.NaN]) {
      await expect(
        list.execute({ patientId: PATIENT_ID, limit }),
        `limite hostil: ${limit}`,
      ).rejects.toThrow(InvalidAttendance);
    }
    await expect(
      list.execute({ patientId: PATIENT_ID, limit: 500 }),
    ).resolves.toBeDefined();
  });

  it("sonda TOCTOU: paciente visível na porta e invisível na query não vaza lista nem detalhe", async () => {
    const { list, get } = makeUseCases(new Set([PATIENT_ID]));

    await expect(list.execute({ patientId: PATIENT_ID })).resolves.toEqual([]);
    await expect(get.execute(PATIENT_ID, ATTENDANCE_ID)).rejects.toThrow(
      AttendanceNotFound,
    );
  });

  it("detalhe cruzado entre pacientes e id gigante respondem o mesmo 404", async () => {
    const { get } = makeUseCases();

    await expect(get.execute(OTHER_PATIENT_ID, ATTENDANCE_ID)).rejects.toThrow(
      AttendanceNotFound,
    );
    await expect(
      get.execute(PATIENT_ID, "x".repeat(100_000)),
    ).rejects.toThrow(AttendanceNotFound);
  });

  it("não-encontrados nunca ecoam id, paciente ou resumo (mensagens fixas)", async () => {
    const { get, create } = makeUseCases();

    await expect(
      get.execute(PATIENT_ID, "id-secreto-fictício"),
    ).rejects.toThrow("Atendimento não encontrado.");
    await expect(
      create.execute({ ...validInput, patientId: "paciente-secreta-fictícia" }),
    ).rejects.toThrow("Paciente não encontrada.");
  });
});
