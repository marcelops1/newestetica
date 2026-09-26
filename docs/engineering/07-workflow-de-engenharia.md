# 07 — Workflow de Engenharia — Newestetica

> **Fonte única do fluxo de engenharia.** Este documento detalha o COMO do processo: a junção entre as etapas do OpenSpec e o método das Agent Skills. Toda decisão de execução deve respeitar este arquivo, `AGENTS.md`, `docs/architecture/04-decisoes-tecnicas.md` e `docs/security/03-seguranca.md`.

---

## 1. Objetivo e autoridade deste documento

Definir o fluxo unificado de engenharia do projeto: quais etapas existem, qual skill governa cada etapa, que artefato cada etapa produz e o que libera a etapa seguinte.

**Autoridade:** este documento detalha o COMO do processo. Em caso de conflito com este arquivo, o `AGENTS.md` continua vencendo.

---

## 2. Princípio de junção: OpenSpec + Agent Skills

- O **OpenSpec** define as etapas e onde os artefatos moram (`openspec/changes/`, `openspec/specs/`), além do gate que libera cada etapa.
- As **Agent Skills** definem o método dentro de cada etapa (como pensar, como quebrar, como implementar, como revisar).
- Nenhum dos dois substitui o outro: etapa sem skill vira improviso; skill sem etapa vira trabalho sem registro nem gate.

---

## 3. Etapa OpenSpec → skill obrigatória → artefato → critério de saída

| Etapa OpenSpec | Skill obrigatória (carregar antes) | Artefato | Critério de saída |
| ---------------- | ----------------------------------- | -------- | ------------------ |
| Explore | `openspec-explore` | Entendimento registrado + nome do change | Escopo e nome definidos, sem ambiguidade material |
| Propose | `openspec-propose` + `spec-driven-development` | `proposal.md` | `pnpm exec openspec validate` passa; capabilities declaradas |
| Specs | `spec-driven-development` | `specs/` (deltas) | Requisitos SHALL testáveis, cada um com cenário WHEN/THEN |
| Design | `spec-driven-development` | `design.md` | Decisões com rationale e alternativas rejeitadas |
| Tasks | `planning-and-task-breakdown` | `tasks.md` | Tasks no formato test-first (seção 5) |
| Apply | `openspec-apply-change` + `incremental-implementation` + `test-driven-development` (+ `frontend-ui-engineering` se for UI) | Código + testes | Gates verdes + Definition of Done (seção 6) |
| Verify | `code-review-and-quality` + `security-and-hardening` | Registros de revisão no change | Revisões registradas; archive bloqueado sem elas |
| Archive | `openspec-archive-change` + `openspec-sync-specs` | Change arquivado + specs sincronizadas | `pnpm exec openspec validate --all` passa |

Em dúvida sobre qual skill usar em qualquer etapa: `using-agent-skills`.

> **CLI portável:** o CLI do OpenSpec é dependência do projeto (`@fission-ai/openspec`, fixado no `package.json` da raiz) — rode sempre `pnpm exec openspec` (ou `pnpm openspec`), nunca `npx openspec`: o pacote público com o nome `openspec` é outro e não tem relação com este projeto. As skills em `.opencode/skills/` e `.agents/skills/` são conteúdo de referência vendorizado e contêm exemplos com a forma curta `openspec ...`; a regra do `AGENTS.md` prevalece sobre esses exemplos.

---

## 4. TDD é inegociável

Ciclo obrigatório: **RED → GREEN → REFACTOR**.

- **RED:** escrever primeiro o teste que falha, provando o comportamento ausente.
- **GREEN:** implementar o mínimo para o teste passar.
- **REFACTOR:** simplificar sem mudar o comportamento, com os testes verdes.

**O que conta como comportamento testável:** qualquer mudança observável — regra de negócio, filtro, validação, estado de UI, formato de dado, gate que reprova.

**A única exceção:** mudanças que não alteram comportamento — documentação, configuração pura, renomeação sem mudança de sentido. A exceção SHALL ser escrita na própria task; sem esse registro, a task segue o ciclo completo.

---

## 5. Formato obrigatório de task

Toda task de implementação SHALL ser precedida pela task do teste que falha.

**Exemplo correto (test-first):**

```markdown
- [ ] 3.1 Escrever o teste que reprova cobertura abaixo de 80% e verificar que ele falha com os scripts atuais
- [ ] 3.2 Configurar o threshold de 80% no runner e verificar que o teste da task 3.1 agora passa e que cobertura menor reprova o build
```

**Exemplo errado (padrão antigo):**

```markdown
- [ ] 3.1 Configurar o threshold de cobertura e verificar que o build passa
```

O segundo não é TDD: ele descreve verificação depois da implementação. Se a configuração estiver errada de um jeito que o próprio verificador não percebe, nada acusa — o teste que falha antes existe justamente para provar que a verificação é capaz de falhar.

---

## 6. Definition of Done

Uma task SHALL ser considerada concluída somente quando atender a todos os itens:

- [ ] Teste que falhou antes de existir código (ou exceção registrada na task, seção 4)
- [ ] Lint passando
- [ ] Formatação passando
- [ ] Typecheck passando
- [ ] Testes com cobertura acima de 80% passando
- [ ] Build passando (quando aplicável)
- [ ] Revisão com `code-review-and-quality` registrada
- [ ] Revisão de segurança contra `docs/security/03-seguranca.md` registrada, quando houver entrada de usuário, autenticação, dados de paciente ou integração (seção 7)
- [ ] Spec sincronizada com a implementação
- [ ] `docs/product/08-backlog-produto.md` atualizado (status do Use Case/Feature refletindo o que foi concluído nesta task)
- [ ] Nenhum dado real de paciente em mocks, testes ou exemplos

> Esta Definition of Done é auto-verificável no momento da abertura do PR através do checklist em `.github/pull_request_template.md` — cada item acima tem um item correspondente no template.

> Em módulos do backend, a ordem de construção TDD por camada (Domain → Application → Infrastructure → Presentation) é obrigatória — ver seção 15. A ordem define QUANDO cada teste exigido acima é escrito; não substitui nenhum item.

### Camadas de defesa do lint e da formatação (pre-commit, CI, branch protection)

O lint e a formatação têm três camadas de defesa independentes, nesta ordem de ocorrência:

1. **Pre-commit local** (husky + lint-staged, ativo via `pnpm install`): feedback em segundos, no momento do commit — erros corrigíveis automaticamente são corrigidos e incluídos no commit; erro que o `--fix` não resolve sozinho barra o commit. É a camada mais rápida e a **menos confiável**: burlável via `--no-verify` e inexistente em quem não rodou `pnpm install`. Nunca é fonte da verdade.
2. **CI** (`quality.yml`): gate **autoritativo** — roda em todo push e PR, sem como pular, com gates, auditoria de dependências e varredura de segredos.
3. **Branch protection**: merge para `main` bloqueado sem CI verde.

> O pre-commit **não substitui** as outras duas camadas: é conveniência de feedback local. A verdade sobre "o commit está limpo" é sempre o CI; o pre-commit apenas evita o feedback tardio.

---

## 7. Segurança em cada etapa

Toda etapa respeita `docs/security/03-seguranca.md`. A revisão com `security-and-hardening` é obrigatória na etapa Verify — e o archive é bloqueado sem o registro — sempre que o change tocar em qualquer um destes gatilhos:

- Entrada de usuário (formulários, uploads, parâmetros, busca)
- Autenticação ou autorização (login, sessão, papéis, 2FA)
- Dados de paciente (cadastro, agendamento, histórico, fotos)
- Integrações externas (e-mail, calendário, WhatsApp, pagamentos)
- Segredos ou configuração sensível (tokens, chaves, `.env`, CI)

Fora dos gatilhos, a revisão de segurança é recomendada, mas o registro continua obrigatório para liberar o archive.

---

## 9. Git: branches e commits

- Uma branch por Change do OpenSpec, com nome igual ao nome do Change.
- Prefixo por natureza do Change:
  - `feature/<nome>` para funcionalidade nova.
  - `fix/<nome>` para correção.
  - `chore/<nome>` ou `infra/<nome>` para decisão técnica/infraestrutura.
  - `docs/<nome>` para documentação pura.
- Branch aberta no início do Explore/Propose; todo o ciclo do Change (Propose, Specs, Design, Tasks, Apply, Verify) acontece nela.
- PR para `main` só na etapa Archive, exigindo CI verde (gates + auditoria + varredura de segredos) como condição de merge.
- Commits no padrão Conventional Commits: `feat`, `fix`, `test`, `docs`, `chore`, `ci`, `refactor` — com escopo entre parênteses quando ajudar (ex.: `feat(catalogo): adiciona filtro por categoria`).
- Skill responsável: `git-workflow-and-versioning`, carregada antes do primeiro commit de cada Change.
- Amarração com a Definition of Done (seção 6): nenhuma task fecha sem commit correspondente no padrão acima.

---

## 11. Backlog sempre atualizado

Nenhuma task ou Change fecha (Verify/Archive) sem atualizar o status correspondente em `docs/product/08-backlog-produto.md`. Isso é parte da Definition of Done, não uma etapa separada. A skill responsável por manter o backlog é `planning-and-task-breakdown`.

---

## 12. Referências cruzadas

- Regras para IAs: `AGENTS.md`
- Decisões técnicas: `docs/architecture/04-decisoes-tecnicas.md`
- Segurança: `docs/security/03-seguranca.md`
- Estado atual: `docs/product/05-estado-atual.md`
- Arquitetura: `docs/architecture/02-arquitetura.md`

---

## 13. Padrão de testes por prioridade

Sempre exigir (parte da Definition of Done, sem exceção):

- Testes unitários completos: casos de sucesso, edge cases e propriedades relevantes da função
- Testes de segurança orientados a OWASP (entrada maliciosa, injeção, escaping) quando o código lida com entrada de usuário ou dado sensível
- **Testes adversariais** (subcategoria de segurança): quando a superfície de ataque existir, além do OWASP básico, exigir tentativas deliberadas de abuso — inputs maliciosos e malformados, fuzzing básico sobre parsers/entradas e tentativas de bypass de autorização/RBAC (ex.: papel inferior tentando operação restrita)
- Testes de contrato/schema quando há fronteira de dados (mock ↔ UI, futuro contrato de API) — cobertos via skill `api-and-interface-design` (instalada), a aplicar quando `contracts/` nascer. No backend, cada contrato de API deve ser verificado nas duas pontas (consumidor/provedor) contra o schema de `contracts/`; divergência entre implementação e contrato reprova o teste
- Testes de integração dos fluxos críticos (ex.: fluxo de agendamento, exibição condicional por consentimento). No backend, integração roda contra PostgreSQL real em container (Docker Compose, conforme `docs/architecture/04-decisoes-tecnicas.md` §19; Testcontainers quando o executor de testes suportar), com banco de teste isolado e migrations aplicadas; mock de banco só é aceito fora de regra de persistência

Exigir com frequência (a critério do Verify, registrado em verification.md quando aplicado ou quando dispensado):

- Mutation testing em lógica de negócio sensível — ferramenta: Stryker Mutator (`npx stryker run` no workspace frontend, via script `pnpm --filter frontend mutation`); meta de mutation score 80%; NÃO integrado ao CI nem aos gates ainda (decisão registrada: adoção manual primeiro, enforcement reavaliado depois)
- Testes de falha e resiliência (o que acontece quando a dependência falha, dado vem malformado, etc.)
- Revisão de segurança do código gerado por IA, além do gatilho já previsto na seção 7

Exigir com parcimônia (só quando o valor justificar o custo):

- Testes E2E completos — reservados a jornadas de alto valor (ex.: fluxo completo de agendamento), não a toda tela nova
- Testes de carga — só quando houver requisito de performance real

Cobertura mínima de testes unitários: 80% (linhas, funções, branches, statements), já configurado como threshold que reprova o build (seção 6 e vitest.config.ts). Cobertura acima de 80% não substitui os testes de segurança/contrato/integração acima — são dimensões diferentes, não intercambiáveis.

Nota sobre princípios: KISS/YAGNI são formalizados via skill `code-simplification` (redução preservando comportamento exato, Cerca de Chesterton) — aplicar sempre antes de `code-review-and-quality` quando o diff parecer maior que o necessário. SOLID fica coberto pelo eixo Arquitetura de `code-review-and-quality` (fronteiras de módulo, direção de dependências, acoplamento) — sem checklist item-a-item dedicado, decisão consciente, não lacuna crítica.

---

## 14. Regressão de prompts de desenvolvimento

Os prompts usados para orquestrar IAs agentic no desenvolvimento (propor, implementar, revisar) são ferramental do projeto e devem ser tratados como qualquer outro artefato: verificáveis, versionados e independentes de qual IA os executa. Esta seção é **prática recomendada**, não gate — não adiciona item à Definition of Done.

### O que a pipeline já cobre

A revisão em estágios já cumpre parcialmente o papel de regressão: toda decisão de IA materializa-se em um artefato revisado (proposal/specs/design/tasks) ou em um gate verde (testes, lint, typecheck, build) antes de tocar o repositório. Um prompt que degradou tende a produzir sinais observáveis **independentemente de qual modelo o executou**:

- artefato vago, sem comandos verificáveis nem critério de saída;
- teste que passa de primeira, sem RED comprovado;
- gate pulado ou "verificado" sem saída colada;
- assunção silenciosa sobre decisão já registrada em docs/spec.

### Prática leve (sem automação agora)

- Manter neste repositório, fora do código de produto, um registro curto dos padrões de prompt que funcionaram bem. Exemplos observados neste projeto (2–3, não exaustivo):
  1. **Exigir o RED colado antes do GREEN** — o registro da falha real do teste antes da implementação reduziu GREEN prematuro.
  2. **Releitura do disco antes de editar** — prompts que mandam ler os arquivos em vez de confiar no relato da sessão evitam edição sobre estado desatualizado.
  3. **Exigir a saída do comando, não a conclusão** — colar saída bruta (grep, teste, curl) no registro do change em vez de "funcionou".
- Padrões adicionais observados na construção do primeiro módulo de backend (Agendamento), a sessão mais longa do projeto até aqui — quatro que reduziram retrabalho:
  4. **Dividir o Apply em grupos por camada, com revisão entre eles** — Domain, Application, Infrastructure e Presentation executados e revisados em blocos separados, cada grupo verde antes do próximo, localizaram erro de escopo cedo (antes de empilhar a pilha inteira).
  5. **Prova negativa real em vez de confiar no teste que passa** — para cada garantia crítica (constraint anti-overbooking, atomicidade da unidade de trabalho, wiring do contexto transacional), quebrar de propósito a proteção e colar a falha resultante provou que o teste distingue certo de errado; teste que passa de primeira por construção foi registrado como tal, não como sucesso. **Refinamento (módulo Conteúdo Público):** em garantias com camadas de defesa independentes (ex.: consentimento em três camadas — default no banco, filtro na query, validação de saída), remover as camadas **uma a uma** prova o papel de cada uma: com a camada 2 fora, a camada 3 falhou fechada (500 sem vazar); removendo as duas, o dado proibido apareceu na resposta HTTP e o teste reprovou — a falha em etapas mostrou qual camada bloqueia o quê, em vez de só "o teste pega".
  6. **Revisão de segurança formal mesmo quando a cobertura "parece" suficiente** — acionar o gatilho de segurança dedicado depois do código pronto rendeu achados reais (limites de tamanho ausentes, campo livre em log) e correções test-first; "já cobrimos o log sem PII" não substitui revisar a fronteira inteira.
  7. **Emenda de design em voo quando a revisão acha lacuna estrutural** — achado que exige mudança de plano vira emenda registrada nos artefatos (design + tasks) antes de continuar, em vez de dívida silenciosa para depois.
  8. **Estado frágil planejado como etapa do grupo (RED real de proteção)** — quando a garantia é "nada passa sem X" (guard de bloqueio, filtro de visibilidade), o próprio tasks.md pode declarar a etapa intermediária frágil antes de a proteção existir (ex.: guard pass-through na task do wiring, mapeamento de saída incompleto na task do controller), de modo que o RED da task seguinte — "a rota responde 200 sem proteção nenhuma", "o campo proibido aparece no corpo" — seja a prova real de que a proteção é a barreira, e o teste com bypass/restauração prove que ela é a **única** barreira. A prova negativa deixa de ser reação pós-hoc e vira passo planejado, agnóstico de modelo, porque a intenção vive no artefato.
  9. **Emenda de design no Apply, registrada antes do GREEN** — quando o próprio RED revela uma lacuna de fronteira (campo duplicado entre path e corpo, retorno de porta sem consumidor, formato que o parser aceita frouxo), a correção não entra direto no código: `design.md` e a spec de delta são emendados e a emenda é registrada no `verification.md` antes de a implementação ficar verde. O código nunca passa à frente do artefato — o preço é um commit de artefato; o ganho é que a spec sincronizada no archive já nasce igual à implementação.
- Registrar sinais de degradação no `verification.md` do change em que forem observados (mesma disciplina dos FYIs), para ajustar o padrão na iteração seguinte.
- Reavaliar automação (ex.: lint de artefatos) quando o volume de changes justificar — sem antecipar.

### Regra de forma

Esta prática é agnóstica de modelo por desenho: nenhum nome de modelo, versão ou fornecedor deve aparecer como parte da regra — a escolha de modelo é livre (ver `AGENTS.md` §7) e a prática deve funcionar igual com qualquer IA agentic.

---

## 15. Ordem de construção TDD por camada (Clean Architecture)

**Princípio: o banco de dados é um detalhe.** A lógica de negócio deve nascer, ser testada e ficar estável ANTES de qualquer linha de código de persistência real. Nenhum módulo do backend nasce pelo banco.

**Ordem obrigatória** — cada camada só começa quando a anterior está testada e verde, sempre no ciclo RED → GREEN → REFACTOR (seção 4):

1. **Domain** — entidades, value objects, regras de negócio puras. Zero import de framework, zero import de ORM (`docs/architecture/02-arquitetura.md` §7). Testes unitários puros: sem banco, sem NestJS TestingModule.
2. **Application** — casos de uso, dependendo somente de INTERFACES de repositório definidas no Domain (portas). Testes com repositório FAKE em memória — nunca banco real nesta camada.
3. **Infrastructure** — implementação real das interfaces contra o banco (Repository Pattern + Data Mapper, nunca Active Record, conforme `docs/architecture/04-decisoes-tecnicas.md` §5). Testes de INTEGRAÇÃO real contra banco em container (Testcontainers/Docker, seção 13), confirmando que a implementação cumpre o contrato da interface do Domain.
4. **Presentation** — controllers, DTOs e validação de entrada via contratos (`contracts/`): a camada mais fina.

**Regra de bloqueio:** nenhuma task de Infrastructure começa antes de Domain e Application estarem com testes verdes. Isso é verificável no formato test-first das tasks de qualquer Change futuro de módulo de backend (seção 5): o RED da task de Infrastructure pressupõe as anteriores verdes; task que pule a ordem reprova no Verify.

**Vínculo com a Definition of Done (seção 6):** a ordem acima não substitui nenhum item da DoD — ela define QUANDO cada teste exigido pela DoD é escrito. Módulos triviais seguem a mesma ordem; o volume de testes segue a seção 13 (proporcional ao risco).

---

## 16. Checklist obrigatório para módulo de backend novo

Todo Change que cria um módulo de backend novo SHALL satisfazer, antes do Archive, os itens abaixo — cada um com evidência nomeada, não intenção:

1. **Contrato sob a skill de interface** — se o módulo define ou consome contrato de API, a skill `api-and-interface-design` foi carregada e citada no `design.md` (decisão de formato e alternativas).
2. **Segurança no planejamento, não só no Verify** — a skill `security-and-hardening` foi carregada DURANTE o Propose/Design/Tasks (citada em `design.md` ou `tasks.md`), com o threat model da fronteira; a revisão do Verify continua obrigatória (seção 7).
3. **Mutation testing medido** — Stryker rodou ao menos uma vez contra o módulo (`pnpm --filter backend mutation`, com o banco de teste no ar), com o score real e a triagem de sobreviventes registrados em `verification.md` (meta da seção 13).
4. **Teste adversarial explícito** — existe task (e teste) de payload hostil/malformado real contra a fronteira do módulo, não apenas raciocínio de revisão: entradas malformadas, limites de tamanho e tentativas de bypass do que o módulo garante.
5. **Aprendizado registrado** — se a sessão teve múltiplas emendas ou grupos, a seção 14 recebeu o padrão observado (agnóstico de modelo, como manda a regra de forma).

> Qualquer prompt futuro que proponha um módulo de backend novo SHALL citar esta seção como parte do escopo da proposta — o lembrete vive no processo, não na memória de quem escreve o prompt.

---

## 17. Manutenção da documentação OpenAPI (Swagger)

Toda task que **cria ou altera um endpoint HTTP** SHALL atualizar os decorators do Swagger na **mesma task**, não depois — mesmo espírito da regra de C2/C3 (seção 3): o esquecimento fica visível no PR e na suíte.

- `@ApiOperation` com resumo; respostas por status real provado pelos testes (`@ApiOkResponse`/`@ApiCreatedResponse`/`@ApiNotFoundResponse`/`@ApiForbiddenResponse`/…); parâmetros (`@ApiParam`/`@ApiQuery`) e corpos derivados dos contratos.
- A fonte dos schemas continua sendo `contracts/` (ponte `nestjs-zod` + `@nestjs/swagger`): **nunca** duplicar campo à mão nos controllers.
- Rotas bloqueadas por guard documentam o status do bloqueio explicitamente (ex.: 403 `AUTH_NOT_IMPLEMENTED` nas rotas de Pacientes).
- Verificação automatizada: `backend/test/integration/openapi.int.spec.ts` cobre as 17 rotas, a fidelidade dos componentes ao contrato e os dois modos do gate por ambiente (`docs/security/03-seguranca.md` §8); o checkbox do PR registra a revisão humana.
