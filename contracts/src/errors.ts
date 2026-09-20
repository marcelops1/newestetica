import type { z } from "zod";

export const VALIDATION_ERROR_CODE = "VALIDATION_ERROR" as const;

export type ValidationFieldMessages = Record<string, string>;

export type ValidationError = {
  code: typeof VALIDATION_ERROR_CODE;
  message: string;
  fields?: ValidationFieldMessages;
};

const WARM_MESSAGE = "Confira os dados e tente de novo — sem pressa.";
const FIELD_MESSAGE = "Valor inválido.";

/**
 * Normaliza um erro do validador para o formato único `{ code, message, fields? }`.
 * Não expõe mensagens, tipos ou stack do validador — só os campos afetados.
 */
export function toValidationError(error: z.ZodError): ValidationError {
  const fields: ValidationFieldMessages = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field.length > 0 && !(field in fields)) {
      fields[field] = FIELD_MESSAGE;
    }
  }
  return {
    code: VALIDATION_ERROR_CODE,
    message: WARM_MESSAGE,
    ...(Object.keys(fields).length > 0 ? { fields } : {}),
  };
}
