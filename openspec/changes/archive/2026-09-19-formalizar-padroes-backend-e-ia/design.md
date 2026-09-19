## Context

Ver `proposal.md` (Why). Ponto de partida verificado por leitura: 02 §7 lista camadas + Repository/Data Mapper sem nomear Clean Architecture nem regra de dependência; `backend/AGENTS.md` §§4–5 idem; docs/07 §13 tem as faixas de prioridade sem o *como* do backend, sem subcategoria adversarial e sem §14 (o arquivo termina no §13 — Referências é o §12, **sem renumeração necessária**, descoberta que simplifica o plano); 04 §§4–9 cobrem camadas/padrões/testes e §19 decide Docker; AGENTS.md §7 lista modelos com "A escolha do modelo é livre"; backlog Feature 4.2 tem intro única + 7 UCs Não iniciados. Spec `engineering-workflow`: 15 requirements sobre enforcement (TDD, test-first, skill por etapa, gate de segurança, gates, template de PR, padrão §13, Stryker, contrato/KISS/SOLID, hook, root gates).

## Goals / Non-Goals

**Goals:**

- Quatro pilares registrados no formato vigente, rastreáveis e prontos para guiar o Épico 4 sem decisões implícitas.

**Non-Goals:**

- Escrever código de backend; automatizar regressão de prompts; mudar specs, backlog além de uma linha, ou o mérito das decisões existentes.

## Decisions

### 1. Clean Architecture nomeada em 02 §7 e `backend/AGENTS.md`, com a regra exata do escopo

Rationale: o nome ancora a intenção e a regra escrita elimina a interpretação livre de "baixo acoplamento". Texto: `domain/` não importa nada fora de `domain/`; `application/` depende só de `domain/`; `infrastructure/` implementa interfaces definidas em `domain/`, nunca o inverso; `presentation/` depende de `application/`. Alternativa considerada: só exemplos sem regra (rejeitada — exemplo não vincula).

### 2. §13 estendida (integração/contrato backend + adversarial), sem reescrever as faixas

Rationale: preserva a estrutura aprovada (sempre/com frequência/parcimônia); integração ganha o *como* (PostgreSQL real em container via Docker Compose, 04 §19; Testcontainers quando o executor suportar; mocks de banco só fora de regra de persistência); contrato ganha o *quando/quem* (já diz "quando `contracts/` nascer" — mantém + fronteira API por consumidor/provedor via `api-and-interface-design`); adversarial entra como subcategoria explícita de segurança (inputs maliciosos deliberados, fuzzing básico, bypass de autorização/RBAC), condicionada a superfície de ataque como o bullet OWASP. Alternativas consideradas: reescrever §13 (rejeitada — invalida a spec que a espelha); subseção separada (rejeitada — adversarial é dimensão de segurança, não pirâmide nova).

### 3. §14 nova ao final (sem renumeração), como prática recomendada — não gate

Rationale: formaliza que a pipeline já cumpre parcialmente o papel (toda decisão de IA materializa-se em artefato revisado ou gate verde antes de tocar o repo — variância de modelo é pega independente de qual modelo produziu); registra o que falta em forma leve: seed de 2–3 padrões observados neste repo + sinais observáveis de degradação (artefatos vagos sem comandos, testes que passam de primeira sem RED, gates pulados, assunções silenciosas), sem automação agora. **Restrição de forma (para manter `skip_specs` válido): nenhum SHALL novo de enforcement e nenhum nome de modelo como parte da regra** — prática, não gate. Alternativas consideradas: gate automatizado de prompts (rejeitada — YAGNI, sem infra para isso); arquivo separado de registro (rejeitada — 07 já é a fonte única do fluxo; extrai-se quando crescer).

### 4. Backlog: uma linha na intro da Feature 4.2, sem tocar os 7 UCs

Rationale: a intro já carrega restrição arquitetural transversal ("monolito modular (Repository + Data Mapper)"); estendê-la com a regra de dependência cobre todos os UCs de uma vez. Alternativa considerada: critério em cada UC 4.2.x (rejeitada — 7 edições repetidas para uma regra transversal).

### 5. `skip_specs: true`, sem delta em `architecture-docs` nem `engineering-workflow`

Rationale: `architecture-docs` governa conteúdos de diagramas C4 + nota de manutenção — nomear Clean Architecture em texto e detalhar o *como* dos testes não altera nenhum SHALL; a nota de manutenção dispara só com mudança de camada e este change altera só docs. Os 4 items novos da spec `engineering-workflow` (padrão §13, Stryker, contrato/KISS/SOLID, hook) continuam satisfeitos — o §13 mantém tudo que a spec exige declarar. Delta idêntico seria vazio; inventar texto violaria as regras. Alternativa considerada: delta MODIFIED para "documentar" (rejeitada — merge no-op, só ruído).

## Risks / Trade-offs

- [Risco] §14 virar letra morta sem enforcement → Mitigação: honesto no texto (prática recomendada + sinais observáveis que qualquer revisor — humano ou IA — checa); automação fica como evolução explícita, não promessa.
- [Risco] Seed de padrões soar como anedota → Mitigação: só padrões observados neste repo, 2–3 no máximo, marcados como exemplos.
- [Trade-off] Nenhum relevante: só texto, sem comportamento.
