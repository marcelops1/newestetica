/* Envio mockado de solicitação de agendamento.
   100% local: nenhuma chamada de rede, nada é persistido.
   `forceError` existe só para demonstração e testes. */

export type BookingInput = {
  name: string;
  phone: string;
  treatment?: string;
  notes?: string;
};

export type BookingResult =
  | { ok: true; treatment: string }
  | { ok: false; message: string };

const SEND_DELAY_MS = 600;

export const DEFAULT_TREATMENT = "Avaliação Geral";

/** Resolve a pré-seleção pela origem: match exato, depois inclusão, senão padrão. */
export function resolveTreatment(
  treatment: string,
  treatmentOptions: string[],
): string {
  if (treatmentOptions.includes(treatment)) return treatment;
  const lower = treatment.toLowerCase();
  const partial = treatmentOptions.find(
    (option) =>
      lower.includes(option.toLowerCase()) ||
      option.toLowerCase().includes(lower),
  );
  return partial ?? DEFAULT_TREATMENT;
}

export function submitBookingRequest(
  input: BookingInput,
  options?: { forceError?: boolean },
): Promise<BookingResult> {
  const treatment = input.treatment?.trim() || "Avaliação Geral";
  return new Promise((resolve) => {
    setTimeout(() => {
      if (options?.forceError) {
        resolve({
          ok: false,
          message:
            "Não conseguimos enviar agora — sem pressa, confira os dados e tente de novo.",
        });
        return;
      }
      resolve({ ok: true, treatment });
    }, SEND_DELAY_MS);
  });
}
