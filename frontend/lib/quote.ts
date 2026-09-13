/* Envio mockado de solicitação de orçamento.
   100% local: nenhuma chamada de rede, nada é persistido.
   `forceError` existe só para demonstração e testes.
   Contrato da fronteira UI ↔ submissão: o payload é validado aqui
   (a UI não é confiável) — payload malformado vira erro acolhedor,
   sem expor detalhes internos. Quando o backend existir, esta é a
   fronteira a trocar pela API real. */

import { getTreatmentOptions } from "./data";

export type QuoteInput = {
  name: string;
  phone: string;
  procedure?: string;
  message?: string;
};

export type QuoteResult =
  { ok: true; procedure: string } | { ok: false; message: string };

export type QuoteFieldErrors = { name?: string; phone?: string };

export const DEFAULT_PROCEDURE = "Avaliação Geral";

const SEND_DELAY_MS = 600;

const WARM_ERROR =
  "Não conseguimos registrar agora — sem pressa, confira os dados e tente de novo.";

/* Texto livre (nome, mensagem) é sempre tratado como texto opaco:
   nunca é interpretado como HTML na submissão nem na renderização
   (a UI renderiza via React, que faz escaping automático). */
const NAME_ERROR = "Conte-nos seu nome para podermos te chamar com carinho.";
const PHONE_ERROR =
  "Confira o WhatsApp com DDD, assim conseguimos te retornar.";

/** Validação amigável por campo, reaproveitada pela UI (mesmo padrão do booking). */
export function validateQuoteFields(input: {
  name: string;
  phone: string;
}): QuoteFieldErrors {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone : "";
  const digits = phone.replace(/\D/g, "");
  const errors: QuoteFieldErrors = {};
  if (name.length < 2) {
    errors.name = NAME_ERROR;
  }
  if (digits.length < 10) {
    errors.phone = PHONE_ERROR;
  }
  return errors;
}

/** Contrato do payload: valida a estrutura sem confiar no chamador. */
export function parseQuoteInput(
  value: unknown,
): { ok: true; input: QuoteInput } | { ok: false; message: string } {
  if (typeof value !== "object" || value === null) {
    return { ok: false, message: WARM_ERROR };
  }
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.name !== "string" ||
    candidate.name.trim().length === 0
  ) {
    return { ok: false, message: WARM_ERROR };
  }
  if (
    typeof candidate.phone !== "string" ||
    candidate.phone.trim().length === 0
  ) {
    return { ok: false, message: WARM_ERROR };
  }
  if (candidate.procedure !== undefined) {
    if (typeof candidate.procedure !== "string") {
      return { ok: false, message: WARM_ERROR };
    }
    if (
      candidate.procedure.trim().length > 0 &&
      !getTreatmentOptions().includes(candidate.procedure)
    ) {
      return { ok: false, message: WARM_ERROR };
    }
  }
  if (
    candidate.message !== undefined &&
    typeof candidate.message !== "string"
  ) {
    return { ok: false, message: WARM_ERROR };
  }
  return {
    ok: true,
    input: {
      name: candidate.name,
      phone: candidate.phone,
      ...(candidate.procedure !== undefined
        ? { procedure: candidate.procedure }
        : {}),
      ...(candidate.message !== undefined
        ? { message: candidate.message }
        : {}),
    },
  };
}

export function submitQuoteRequest(
  value: unknown,
  options?: { forceError?: boolean },
): Promise<QuoteResult> {
  const parsed = parseQuoteInput(value);
  if (!parsed.ok) {
    return Promise.resolve({ ok: false, message: WARM_ERROR });
  }
  const fields = validateQuoteFields(parsed.input);
  if (fields.name || fields.phone) {
    return Promise.resolve({ ok: false, message: WARM_ERROR });
  }
  const procedure = parsed.input.procedure?.trim() || DEFAULT_PROCEDURE;
  return new Promise((resolve) => {
    setTimeout(() => {
      if (options?.forceError) {
        resolve({ ok: false, message: WARM_ERROR });
        return;
      }
      resolve({ ok: true, procedure });
    }, SEND_DELAY_MS);
  });
}
