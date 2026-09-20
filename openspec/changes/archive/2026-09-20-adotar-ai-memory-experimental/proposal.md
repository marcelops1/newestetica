# Change: adotar-ai-memory-experimental

## Why

Vale testar o ai-memory (servidor de memória de longo prazo cross-agent, Markdown versionado em Git, modo zero-LLM, self-hosted via Docker) como continuidade **informal** entre sessões e IAs — contexto de conversa e decisões de passagem que não viram artefato formal do OpenSpec. Sem registro, cada IA decide por conta própria se/como usar ferramentas de sessão, inclusive quanto a dados de paciente — risco que precisa de regra explícita **antes** de qualquer instalação real (que fica fora deste change, feita separadamente na máquina do usuário).

## What Changes

- Registra em `docs/architecture/04-decisoes-tecnicas.md` o item §20 ("ai-memory como ferramenta experimental de continuidade entre agentes"), no formato vigente (Escolhido/Motivos/Alternativas/Implicações), renumerando Referências para §21: adoção **experimental, não obrigatória**; portabilidade informal complementar ao OpenSpec; ferramenta de **desenvolvimento**, nunca em produção/VPS/Kubernetes; roda **separada** de `infra/docker/docker-compose.yml`; não substitui `AGENTS.md` nem OpenSpec como fonte de verdade.
- Adiciona em `docs/security/03-seguranca.md` (§4, Proteção de Dados) a regra crítica: ai-memory (ou qualquer captura de sessão) **NUNCA** captura dado real de paciente; hoje só há mocks (risco baixo), mas a regra deve ser revisada e reforçada (exclusão de path/allowlist da ferramenta) **antes** de existir dado real no projeto, quando o backend for implementado.
- Nota curta em `AGENTS.md` (§12, Agent Skills): ferramenta opcional e experimental; em conflito, este `AGENTS.md` sempre vence (mesma cláusula de prevalência das skills).
- `.ai-memory.toml` de roteamento: **não criado agora** — sem instalação real, seria config morta; nasce com a instalação, em change próprio.
- Explicitamente fora: instalação do servidor, wiring de hooks, qualquer código, specs, backlog, e outras decisões.

## Capabilities

### New Capabilities

- Nenhuma (registro de decisão + regra de segurança, sem comportamento de produto).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true` — avaliação no design: nenhuma spec espelha 04-§20/03-regra/AGENTS-nota como SHALL).

## Impact

- `docs/architecture/04-decisoes-tecnicas.md` (nova §20 + Referências→§21), `docs/security/03-seguranca.md` (subseção em §4), `AGENTS.md` (nota no §12).
- Sem impacto em código, specs, contratos, mocks, dados, CI ou `infra/docker/`.
