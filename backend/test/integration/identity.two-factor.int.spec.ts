import { afterAll, beforeAll, describe, expect, it } from "vitest";

/* Prova de 2FA contra o realm REAL do compose (design decisão 6): o fluxo de
   login só com senha NÃO pode concluir — os usuários de desenvolvimento têm o
   segundo fator exigido (TOTP) e a sessão para na configuração/execução do OTP,
   NUNCA num redirect de autorização com `code`. Sem Keycloak no ar (ex.: CI de
   backend, que não sobe o serviço), a suíte é pulada com motivo registrado no
   verification.md — a prova roda localmente com `make up`. */

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://127.0.0.1:8080";
const REALM = "newestetica";
const CLIENT_ID = "newestetica-frontend";
const REDIRECT_URI = "http://localhost:3000/callback";

const USERS = [
  { username: "fabiana-dev", password: "dev-fabiana-2fa", role: "admin" },
  { username: "recepcao-dev", password: "dev-recepcao-2fa", role: "reception" },
];

let keycloakUp = false;
let skipReason = "";

type LoginOutcome = {
  completed: boolean;
  finalUrl: string;
  body: string;
};

function captureCookies(response: Response, jar: Map<string, string>): void {
  for (const cookie of response.headers.getSetCookie?.() ?? []) {
    const [pair] = cookie.split(";");
    const index = pair?.indexOf("=") ?? -1;
    if (pair && index > 0) {
      jar.set(pair.slice(0, index), pair.slice(index + 1));
    }
  }
}

function cookieHeader(jar: Map<string, string>): string {
  return [...jar.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function findLoginForm(html: string): RegExpExecArray | null {
  return (
    /<form[^>]*id="kc-form-login"[^>]*action="([^"]+)"/s.exec(html) ??
    /action="([^"]*login-actions\/authenticate[^"]*)"/s.exec(html)
  );
}

function isKeycloakUrl(url: string): boolean {
  return url.startsWith(KEYCLOAK_URL);
}

/* Segue redirects DENTRO do Keycloak apenas; se o destino for o redirect_uri do
   client (com `code`), marca conclusão sem buscar o host externo. */
async function followWithinKeycloak(
  response: Response,
  jar: Map<string, string>,
): Promise<LoginOutcome> {
  let current = response;
  let body = "";
  for (let hop = 0; hop < 6; hop += 1) {
    const location = current.headers.get("location");
    if (current.status >= 300 && current.status < 400 && location) {
      if (!isKeycloakUrl(location)) {
        return { completed: true, finalUrl: location, body };
      }
      current = await fetch(location, {
        redirect: "manual",
        headers: { cookie: cookieHeader(jar) },
      });
      captureCookies(current, jar);
      continue;
    }
    body = await current.text();
    return { completed: false, finalUrl: current.url, body };
  }
  return { completed: false, finalUrl: current.url, body };
}

/* Tenta concluir o login informando APENAS usuário e senha; devolve se a sessão
   CONCLUIU (redirect de autorização com code) e onde parou. */
async function loginPasswordOnly(
  username: string,
  password: string,
): Promise<LoginOutcome> {
  const jar = new Map<string, string>();
  const authorizeUrl = new URL(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
  );
  authorizeUrl.searchParams.set("client_id", CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid");
  authorizeUrl.searchParams.set("state", "prova-2fa");

  /* O Keycloak 26 serve a página de login direto no authorize (200) ou via
     redirect (302 → login-actions); o laço cobre os dois formatos. */
  let response = await fetch(authorizeUrl, { redirect: "manual" });
  captureCookies(response, jar);
  let html = await response.text();
  let actionMatch = findLoginForm(html);
  for (
    let hop = 0;
    !actionMatch && response.status >= 300 && response.status < 400 && hop < 5;
    hop += 1
  ) {
    const location = response.headers.get("location");
    if (!location) break;
    response = await fetch(location, {
      redirect: "manual",
      headers: { cookie: cookieHeader(jar) },
    });
    captureCookies(response, jar);
    html = await response.text();
    actionMatch = findLoginForm(html);
  }
  if (!actionMatch?.[1]) {
    throw new Error(
      `formulário de login não encontrado (URL ${response.url}): ${html.slice(0, 200)}`,
    );
  }

  const actionUrl = new URL(actionMatch[1].replaceAll("&amp;", "&"), KEYCLOAK_URL);
  const afterCredentials = await fetch(actionUrl, {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookieHeader(jar),
    },
    body: new URLSearchParams({
      username,
      password,
      credentialId: "",
    }).toString(),
  });
  captureCookies(afterCredentials, jar);
  return followWithinKeycloak(afterCredentials, jar);
}

beforeAll(async () => {
  try {
    const response = await fetch(
      `${KEYCLOAK_URL}/realms/${REALM}/.well-known/openid-configuration`,
      { signal: AbortSignal.timeout(3_000) },
    );
    keycloakUp = response.ok;
    if (!keycloakUp) {
      skipReason = `Keycloak respondeu ${response.status} em ${KEYCLOAK_URL}`;
    }
  } catch (error) {
    keycloakUp = false;
    skipReason = `Keycloak inacessível em ${KEYCLOAK_URL}: ${String(error).slice(0, 80)}`;
  }
});

afterAll(() => {
  if (!keycloakUp) {
    console.warn(`[2FA] suíte pulada — ${skipReason}`);
  }
});

describe("2FA obrigatório no realm (prova contra o Keycloak real)", () => {
  it.each(USERS)(
    "login só com senha de $username ($role) não conclui e para no segundo fator",
    async (user, context) => {
      if (!keycloakUp) {
        context.skip();
        return;
      }

      const outcome = await loginPasswordOnly(user.username, user.password);

      /* A prova: a sessão NÃO terminou num redirect de autorização com `code`. */
      expect(outcome.completed, JSON.stringify(outcome).slice(0, 300)).toBe(
        false,
      );
      /* E parou no SEGUNDO FATOR (não em outra ação obrigatória qualquer). */
      expect(
        outcome.finalUrl + outcome.body,
      ).toMatch(/totp|otp|CONFIGURE_TOTP/i);
      expect(outcome.finalUrl).not.toMatch(/VERIFY_PROFILE/i);
    },
  );
});
