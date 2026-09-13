# Verificação — pagina-orcamento

Revisão com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilho docs/07 §7: formulário = entrada de usuário real) + revisão com `code-review-and-quality`. Data: 2026-09-13.

## Threat model (5 min)

- **Fronteira:** formulário público `/orcamento` (nome, WhatsApp, select de procedimento, mensagem) → camada `lib/quote.ts` → confirmação local. Nenhum dado cruza rede nem persistência.
- **Ativo:** privacidade da paciente (dados pessoais: nome + contato — docs/03 §4).
- **Abuse cases (OWASP):** (A03/XSS) marcação em nome/mensagem interpretada como HTML; (entrada hostil) payload estruturalmente malformado chegando à submissão ignorando a validação da UI; (A04) falsa sensação de persistência/uso dos dados.
- **STRIDE rápido:** Spoofing/EoP n/a (página pública sem auth); Tampering — dados não trafegam; quando o backend existir, revalidação server-side é obrigatória (registrada como nota futura); Repudiation n/a nesta fase; Information Disclosure — erros acolhedores genéricos testados contra vazamento (`not.toMatch(/undefined|TypeError|stack/i)`); DoS — mensagem sem cap (aceitável em mock sem persistência; cap server-side quando existir backend); EoP n/a.

## Revisão security-and-hardening (contra docs/03)

- [x] **Validação de entrada na fronteira** (docs/03 §7): `submitQuoteRequest` recebe `unknown` e valida via `parseQuoteInput` (estrutura + allowlist do procedimento via `getTreatmentOptions()`) e `validateQuoteFields` (nome ≥2, WhatsApp ≥10 dígitos) — a UI não é confiável; validação client não é tratada como fronteira de segurança (docs/03 §10 item 7).
- [x] **XSS/escaping (confirmação por grep exigida):** `grep -rn "innerHTML\|dangerouslySetInnerHTML" frontend/` retorna vazio; nome e mensagem são tratados como texto opaco na submissão e **não são renderizados em nenhum ponto da UI** — a única ecoação é o procedimento, que vem de allowlist (`getTreatmentOptions()`); renderização pública é 100% auto-escape do React (nós de texto).
- [x] **Minimização de dados e finalidade** (docs/03 §4): coleta apenas nome, WhatsApp, procedimento de interesse e mensagem opcional; finalidade informada na página ("orçamento personalizado", retorno da recepção) e nota LGPD junto ao formulário; nada é armazenado (mock sem persistência).
- [x] **Erros sem detalhes internos** (docs/03 §8): `WARM_ERROR` único, sem stack/nome de campo interno; testes afirmam ausência de vazamento.
- [x] **Sem dado real de paciente** (docs/03 §11): testes e mocks usam "Maria Exemplo" e placeholders fictícios; select alimentado pelos mocks existentes sem novos dados.
- [x] **Segredos**: nenhum segredo, `.env` ou token introduzido; diff sem credenciais.
- [x] **Sem rede**: `grep -rn "fetch(\|XMLHttpRequest\|axios\|WebSocket" frontend/lib/quote.ts frontend/features/quote/ frontend/app/orcamento/` vazio; spy de `fetch` afirma zero chamadas nos testes.
- [x] Sem dependências novas; nenhum script de install alterado.

## Revisão code-review-and-quality (5 eixos)

- **Correção:** comportamento idêntico ao delta do spec (4 estados, sem rede, confirmação sem valores fechados); 38 testes novos cobrindo contrato, edge cases, OWASP e fronteira. Nenhum off-by-one/estado inconsistente (dados preservados no erro — formulário não remontado).
- **Legibilidade:** constantes nomeadas (`WARM_ERROR`, `DEFAULT_PROCEDURE`), funções de responsabilidade única; comentários no padrão `booking.ts`/`data.ts`.
- **Arquitetura:** espelha o padrão aprovado do booking (design decisão 1); select consome `getTreatmentOptions()` (ponto único de acesso); fronteira isolada em `lib/` para troca futura por API real; sem dependência circular (`quote → data → mocks`); página segue o padrão validado `AboutPage`.
- **Segurança:** ver seção acima — sem achados.
- **Performance:** sem loops unbounded; página estática; delay mockado único.
- **Achados:** nenhum Critical/Required. *FYI:* sem cap de tamanho na mensagem (trade-off registrado no threat model); *Nit:* cast defensivo `value as { name; phone }` antes de `validateQuoteFields` — seguro (função re-checa tipos), documentado.
- **Veredito:** Aprovado.

## Aplicação da seção 13 (registro de aplicados e dispensas)

- **Aplicado — unitários com edge cases:** `submitQuoteRequest` (sucesso com procedimento, default quando vazio, `forceError` acolhedor, sem rede), `parseQuoteInput` (campo ausente, tipo errado, entrada nula, procedimento desconhecido/vazio), `validateQuoteFields` (nome curto/só espaços, WhatsApp com letras/incompleto, válidos).
- **Aplicado — segurança OWASP (task dedicada):** `<script>alert(1)</script>`, `<img onerror>`, `&`, aspas em nome/mensagem tratados como texto opaco; payload inválido rejeitado na fronteira; grep de `innerHTML`/`dangerouslySetInnerHTML` vazio.
- **Aplicado — contrato/schema (skill `api-and-interface-design`):** `QuoteInput`/`QuoteResult`/`parseQuoteInput` como contrato nomeado da fronteira UI ↔ submissão, RED-first; documenta a futura troca mock → API.
- **Aplicado — integração do fluxo crítico (preencher → enviar → confirmação):** verificação pelos gates disponíveis (rota `/orcamento` prerenderizada, typecheck, testes da lib, revisão manual dos estados sucesso/erro com dados preservados). Limitação registrada: sem `@testing-library` no projeto, clique/fluxo de componente não é simulável (mesma lacuna dos changes anteriores).
- **Dispensado — mutation:** lógica trivial (trim/default/delay mockado), sem negócio sensível — mesma justificativa do change de depoimentos.
- **Dispensado — E2E (parcimônia):** jornada de alto valor é agendamento; orçamento não recebe E2E nesta fase.
- **Dispensado — carga (parcimônia):** sem requisito de performance.
- **Parcial — falha/resiliência:** coberta por `forceError` (dados preservados, nova tentativa) e payloads malformados; sem outras dependências externas.

## Gates executados (task 4.1)

- `pnpm lint` — passou (0 erros; 1 warning pre-existente em `stryker.config.mjs`, fora do escopo deste change)
- `pnpm format` — passou (todos os arquivos no estilo Prettier)
- `pnpm typecheck` — passou (`tsc --noEmit`)
- `pnpm test` — 8 arquivos, 50 testes, cobertura 97,95% stmts / 92,42% branches / 100% funcs / 97,77% lines (todos >80%)
- `pnpm build` — passou (`/orcamento` prerenderizada como estática)
- `openspec validate --changes` — 1 passed, 0 failed (`change/pagina-orcamento`)

## TDD (docs/07 §4)

- [x] RED comprovado antes de cada GREEN: task 1.1 (`Cannot find module '../quote'`), task 2.1 (8/12 testes falhando, incl. aceitação indevida de payload inválido na fronteira). Não houve exceção — todas as tasks de código seguiram RED → GREEN.
