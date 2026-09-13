/* Envio mockado de mensagem de contato.
   100% local: nenhuma chamada de rede, nada é persistido.
   `forceError` existe só para demonstração e testes.
   Contrato da fronteira UI ↔ submissão: o payload é validado aqui
   (a UI não é confiável) — payload malformado vira erro acolhedor,
   sem expor detalhes internos. Quando o backend existir, esta é a
   fronteira a trocar pela API real. */

export type ContactInput = {
  name: string;
  /** E-mail válido OU WhatsApp com DDD — campo único flexível. */
  contact: string;
  message: string;
};

export type ContactResult = { ok: true } | { ok: false; message: string };

export type ContactFieldErrors = {
  name?: string;
  contact?: string;
  message?: string;
};

const SEND_DELAY_MS = 600;

const WARM_ERROR =
  "Não conseguimos enviar agora — sem pressa, confira os dados e tente de novo.";

/* Texto livre (nome, mensagem) é sempre tratado como texto opaco:
   nunca é interpretado como HTML na submissão nem na renderização
   (a UI renderiza via React, que faz escaping automático). */
const NAME_ERROR = "Conte-nos seu nome para podermos te chamar com carinho.";
const CONTACT_ERROR =
  "Deixe um e-mail válido ou um WhatsApp com DDD, assim conseguimos te responder.";
const MESSAGE_ERROR =
  "Escreva com suas palavras o que você gostaria de nos contar.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 10;
}

function isValidContact(value: string): boolean {
  return isValidEmail(value) || isValidPhone(value);
}

/** Validação amigável por campo, reaproveitada pela UI (mesmo padrão do orçamento). */
export function validateContactFields(input: {
  name: string;
  contact: string;
  message: string;
}): ContactFieldErrors {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const contact =
    typeof input.contact === "string" ? input.contact.trim() : "";
  const message =
    typeof input.message === "string" ? input.message.trim() : "";
  const errors: ContactFieldErrors = {};
  if (name.length < 2) {
    errors.name = NAME_ERROR;
  }
  if (!isValidContact(contact)) {
    errors.contact = CONTACT_ERROR;
  }
  if (message.length === 0) {
    errors.message = MESSAGE_ERROR;
  }
  return errors;
}

/** Contrato do payload: valida a estrutura sem confiar no chamador. */
export function parseContactInput(
  value: unknown,
): { ok: true; input: ContactInput } | { ok: false; message: string } {
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
    typeof candidate.contact !== "string" ||
    candidate.contact.trim().length === 0
  ) {
    return { ok: false, message: WARM_ERROR };
  }
  if (
    typeof candidate.message !== "string" ||
    candidate.message.trim().length === 0
  ) {
    return { ok: false, message: WARM_ERROR };
  }
  if (!isValidContact(candidate.contact.trim())) {
    return { ok: false, message: WARM_ERROR };
  }
  return {
    ok: true,
    input: {
      name: candidate.name,
      contact: candidate.contact,
      message: candidate.message,
    },
  };
}

export function submitContactRequest(
  value: unknown,
  options?: { forceError?: boolean },
): Promise<ContactResult> {
  const parsed = parseContactInput(value);
  if (!parsed.ok) {
    return Promise.resolve({ ok: false, message: WARM_ERROR });
  }
  const fields = validateContactFields(parsed.input);
  if (fields.name || fields.contact || fields.message) {
    return Promise.resolve({ ok: false, message: WARM_ERROR });
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      if (options?.forceError) {
        resolve({ ok: false, message: WARM_ERROR });
        return;
      }
      resolve({ ok: true });
    }, SEND_DELAY_MS);
  });
}
