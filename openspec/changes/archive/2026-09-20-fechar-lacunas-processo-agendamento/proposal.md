# Change: fechar-lacunas-processo-agendamento

## Why

A auditoria pós-`backend-modulo-agendamento` encontrou duas lacunas pontuais — o Stryker nunca mediu `contracts/` nem `backend/`, e a seção 14 de docs/07 segue com os 3 exemplos genéricos iniciais — e uma lacuna estrutural: nada no processo impede que o próximo módulo de backend repita os mesmos esquecimentos (skill de contrato/security só no Verify, mutation nunca rodado, teste adversarial ausente, §14 não alimentada). Este change fecha as lacunas pontuais (**Frente A**) e cria a trava estrutural (**Frente B**).

## What Changes

**Frente A — fechar as lacunas deste módulo:**

- Configuração Stryker executável em `backend/` e `contracts/`, replicando o padrão do frontend (mesmo runner, mesmos thresholds, exclusões equivalentes, manual — sem CI).
- Execução real do mutation testing contra o módulo de Agendamento (`backend/src/scheduling/`) e os schemas de `contracts/src/scheduling/`, com o score obtido registrado em `verification.md`.
- Registro real da sessão do módulo de Agendamento na seção 14 de docs/07 (padrões observados, agnósticos de modelo, sem nomear IA específica), mantendo o limite de 2–3 exemplos curtos por padrão da seção.

**Frente B — prevenir recorrência (estrutural):**

- Nova seção 16 em docs/07, "Checklist obrigatório para módulo de backend novo": lista verificável que todo Change de módulo novo deve satisfazer antes do Archive — (a) `api-and-interface-design` carregada e citada no design quando há contrato; (b) `security-and-hardening` carregada DURANTE o planejamento, não só no Verify; (c) mutation rodado ao menos uma vez com score em `verification.md`; (d) task explícita de teste adversarial com payload hostil real; (e) alimentar a §14 quando a sessão for complexa (múltiplas emendas/grupos).
- Seção condicional no `.github/pull_request_template.md`: quando o PR for de módulo de backend novo, o template traz os itens do checklist como caixas — o esquecimento fica visível no PR, sem depender de lembrança.
- A própria seção 16 registra que prompts futuros propondo módulo novo devem citá-la — o lembrete vive no processo, não na cabeça de quem escreve o prompt.
- Explicitamente fora: integrar Stryker ao CI/gates (vale a decisão já registrada de adoção manual primeiro); reescrever a seção 14; mudar thresholds do frontend; automação de lint de artefatos (volume ainda não justifica, mesma razão da §14).

## Capabilities

### New Capabilities

- `mutation-testing`: mutation testing executável por workspace (config Stryker + suíte que o alimenta), com score medido e registrado para o módulo de referência — ver `specs/mutation-testing/spec.md`.

### Modified Capabilities

- `engineering-workflow`: adiciona requirements do checklist de módulo novo (seção 16 do docs/07) e da seção condicional do template de PR — ver `specs/engineering-workflow/spec.md`. O registro na seção 14 de docs/07 segue sendo documentação de processo, como backlog. Sem `skip_specs` porque mutation (Frente A) e checklist/template (Frente B) são comportamento real e testável.

## Impact

- Novos: `backend/stryker.config.mjs`, `contracts/stryker.config.mjs`, `specs/mutation-testing/spec.md`.
- Editados: `backend/package.json` e `contracts/package.json` (deps do Stryker + script `mutation`), `docs/engineering/07-workflow-de-engenharia.md` (seção 14 aditiva na Frente A; nova seção 16 na Frente B), `.github/pull_request_template.md` (seção condicional da Frente B).
- Sem impacto em código de produto, specs de produto existentes, mocks, contratos ou dados; nenhum teste existente muda.
