## Context

Ver `proposal.md` (Why). Ponto de partida: docs/07 exigia testes + 80% sem tipificar; seção 13 já redigida no working tree. Antes de formalizar, investigou-se (Fase 1) o que as skills instaladas já cobrem, para não exigir na DoD o que ninguém ensina a fazer.

## Goals / Non-Goals

**Goals:**

- Formalizar a seção 13 via change, com spec sincronizada.
- Documentar as lacunas como risco, sem criar skills novas.

**Non-Goals:**

- Criar ou alterar skills; mudar gates, thresholds ou outro doc.

## Decisions

### 1. Faixas sempre / com frequência / com parcimônia, ancoradas na cobertura existente

Rationale: reflete custo-benefício real e reaproveita o threshold de 80% já configurado; declarar não intercambialidade fecha a brecha "cobertura alta dispensa o resto".
Alternativas consideradas: exigir tudo sempre (rejeitado: E2E/carga em toda tela inviabiliza o fluxo).

### 2. Evidência da Fase 1 (tabela skill × tipo de teste)

| Tipo de teste | Skill que cobre (ou "nenhuma") | Trecho do SKILL.md que comprova |
|---|---|---|
| Unitários com edge cases e propriedades | test-driven-development (parcial: edge cases sim, propriedades não) | "Adding edge case handling"; "Unit Tests (~80%), Pure logic, isolated"; exemplos `rejects empty titles`, `trims whitespace`. Property-based não mencionado |
| Segurança orientados a OWASP | security-and-hardening (parcial: prevenção sim, como testar não) | "OWASP Top 10 Prevention Patterns" (Injection, XSS, SSRF…); "Write abuse cases next to use cases… then make that your first test". Sem guia de escrita de testes |
| Contrato/schema | nenhuma (TDD só tangencia) | TDD cita "API boundaries" e "Does it cross a boundary? → Integration test"; nada sobre contrato/schema |
| Integração de fluxos críticos | test-driven-development (média) | "Integration Tests (~15%), Component interactions, API boundaries". Sem padrões de fluxos críticos |
| Mutation testing | nenhuma | Zero menções nas três skills |
| Falha e resiliência | nenhuma (só revisão) | code-review: "Are error paths handled (not just the happy path)?" — item de revisão, não teste |
| E2E | test-driven-development (média-alta) | "E2E Tests (~5%), Full user flows, real browser"; "limit these to critical paths"; seção Browser Testing with DevTools |
| Carga | nenhuma (menção passageira) | TDD cita "performance benchmarks" como exemplo de teste Large; code-review cobre performance como revisão, não teste |

Não-lacuna registrada: "revisão de segurança de código gerado por IA" **é** coberta por code-review-and-quality ("AI code needs more scrutiny, not less").

## Risks / Trade-offs

- [Risco] Exigir mutation, falha/resiliência, contrato/schema e carga sem skill que ensine → Mitigação: seção 13 os coloca nas faixas "com frequência/parcimônia" a critério do Verify (não bloqueiam por padrão); lacuna documentada aqui, sem criar skill agora (decisão do solicitante).
- [Risco] Testes OWASP exigidos "sempre" mas skill só ensina prevenção → Mitigação: abuse-cases-como-primeiro-teste (security-and-hardening) é o método mínimo aceito; guia de escrita de testes de segurança fica como lacuna conhecida.
- [Trade-off] Nenhum relevante (docs puros).
