## 1. Esquema bearer no Swagger (R3, test-first)

- [x] 1.1 Escrever o teste em `openapi.int.spec.ts` afirmando que `components.securitySchemes.bearer` existe (`type: "http"`, `scheme: "bearer"`) e que cada uma das 9 rotas administrativas o exige em `security`, e verificar que falha — RED. Verificação: `expected undefined`/`toContainEqual` falhando com o documento atual
- [x] 1.2 Declarar `.addBearerAuth()` no `DocumentBuilder` e `@ApiBearerAuth()` nos 3 controllers administrativos, e verificar que o teste da task 1.1 passa sem quebrar os demais — GREEN. Verificação: teste da task 1.1 verde + suíte `openapi` verde

## 2. Tags legadas + sync (sem comportamento)

- [x] 2.1 Remover os 3 `.addTag("... (bloqueado até a Identidade)")` de `backend/src/swagger.ts` e provar que nada os referencia — exceção docs/07 §4 (remoção de código morto sem comportamento observável). Verificação: grep vazio + suíte `openapi` verde
- [x] 2.2 Sincronizar o delta de `api-documentation` para `openspec/specs/` no archive e validar — exceção docs/07 §4. Verificação: `pnpm exec openspec validate --all` passa
