## Context

Ver `proposal.md` (Why). Ponto de partida: arquitetura só em texto; frontend real com `app/`, `components/`, `features/`, `lib/`; backend vazio (só `AGENTS.md`); externos decididos em `docs/02`/`docs/04` (Keycloak, e-mail transacional futuro, calendário desejável). Restrição: documentar o decidido, sem inventar.

## Goals / Non-Goals

**Goals:**

- Mapa visual fiel ao decidido, renderizável no GitHub sem ferramenta externa (Mermaid).
- Manutenção amarrada ao ciclo (nota por arquivo + gatilho proposto na DoD).

**Non-Goals:**

- Nível 4 (Code); detalhar módulos do backend antes de existirem; mudar decisões.

## Decisions

### 1. Mermaid inline nos .md

Rationale: renderiza direto no GitHub, versiona junto, sem exportar imagens nem depender de ferramenta externa.
Alternativas consideradas: diagramas como imagem (rejeitado: binário não revisável em diff) e ferramenta externa (rejeitado: dependência e link quebrável).

### 2. Marcação explícita real vs planejado em C1/C2

Rationale: o erro mais caro seria ler plano como existente; a marcação visual elimina a ambiguidade na origem.
Alternativas consideradas: documentar só o real (rejeitado: esconderia o norte aprovado) e só o alvo (rejeitado: confundiria o estado atual).

### 3. C3 só do frontend + placeholder normatizado do backend

Rationale: diagramar o que não existe seria invenção; o placeholder por módulo (Domain/Application/Infrastructure/Presentation, `docs/02` §7) dá o molde sem antecipar conteúdo.
Alternativas consideradas: C3 completo hipotético (rejeitado: especulação) e omitir backend (rejeitado: perderia o gancho de evolução).

### 4. Gatilho na DoD sem amarração de skill

Rationale: `documentation-and-adrs` não está instalada em `.opencode/skills/`; amarrar skill inexistente criaria obrigação impossível de cumprir. A obrigação vale por texto até a skill existir.
Alternativas consideradas: amarrar mesmo assim (rejeitado: referência quebrada) e instalar a skill neste change (rejeitado: fora do escopo documental).

## Risks / Trade-offs

- [Risco] Diagramas desatualizarem após mudanças → Mitigação: nota de manutenção por arquivo + gatilho na DoD.
- [Risco] Mermaid complexo demais para revisar em diff → Mitigação: diagramas pequenos, um por arquivo, texto de apoio curto.
- [Trade-off] C1/C2 mostram sistemas ainda não existentes → Aceito: marcados como planejados, é o norte aprovado, não promessa de prazo.

## Gatilho proposto para a DoD (NÃO aplicado nesta sessão)

Texto sugerido para `docs/07-workflow-de-engenharia.md` §6, a aplicar em change próprio:

- [ ] Diagramas C4 da camada tocada atualizados (`docs/architecture/c1-context.md`, `c2-container.md`, `c3-component.md`), quando o Change alterar atores, contêineres, componentes ou integrações.

Sem amarração de skill (`documentation-and-adrs` não instalada — ver Decisão 4).
