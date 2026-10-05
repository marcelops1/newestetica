import {
  AUTH_FORBIDDEN_CODE,
  AUTH_FORBIDDEN_MESSAGE,
  AUTH_UNAUTHENTICATED_CODE,
  AUTH_UNAUTHENTICATED_MESSAGE,
} from "./token-verifier";

/* Documentação compartilhada do 401/403 de autenticação (docs/07 §17): plumbing
   puro do kernel — os três módulos administrativos documentam o MESMO contrato de
   erro, sem duplicar literais. */

export const AUTH_401_DESCRIPTION =
  "Sem token válido (ausente, malformado, expirado, assinatura/emissor/audiência inválidos ou algoritmo não permitido): 401 fixo, sem eco do motivo.";

export const AUTH_401_SCHEMA = {
  type: "object",
  properties: {
    code: { type: "string", example: AUTH_UNAUTHENTICATED_CODE },
    message: { type: "string", example: AUTH_UNAUTHENTICATED_MESSAGE },
  },
};

export const AUTH_403_DESCRIPTION =
  "Token válido sem o papel exigido pela rota: 403 fixo, idêntico para papel ausente ou insuficiente, sem vazar dado.";

export const AUTH_403_SCHEMA = {
  type: "object",
  properties: {
    code: { type: "string", example: AUTH_FORBIDDEN_CODE },
    message: { type: "string", example: AUTH_FORBIDDEN_MESSAGE },
  },
};
