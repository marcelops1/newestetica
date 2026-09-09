## Context

Ver `proposal.md` (Why). Ponto de partida: `.github/` contém só `workflows/` (sem template de PR); docs/07 §6 lista a DoD sem apontar nenhum mecanismo auto-verificável na abertura do PR; C2/C3 terminam com notas de manutenção que ninguém é lembrado de ler no momento do PR. Restrição: só criar o template e referenciá-lo na DoD.

## Goals / Non-Goals

**Goals:**

- Todo PR aberto já nascer com o checklist, no formato que o GitHub reconhece automaticamente (`.github/pull_request_template.md`).
- Cada item do checklist espelhar um item verificável da DoD/gates, com a pergunta C2/C3 formulada como condicional ("alterou? se sim, atualizou").
- DoD (docs/07 §6) ganhar uma linha de amarração apontando para o template.

**Non-Goals:**

- Mudar gates, CI, política de merge ou exigir preenchimento via automação/bot.
- Tocar C1/C2/C3, backlog ou qualquer código de produto.

## Decisions

### 1. Um único `.github/pull_request_template.md`, sem múltiplos templates

Rationale: um template único é aplicado automaticamente a todo PR; múltiplos templates exigiriam `?template=` na URL e seriam ignorados na prática.
Alternativas consideradas: pasta `PULL_REQUEST_TEMPLATE/` com vários arquivos (rejeitado: dispersa e não é default).

### 2. Checklist em Markdown com 6 itens + seção de contexto livre

Rationale: espelha 1:1 os itens pedidos (gates, TDD, segurança, backlog, C2/C3, archive) e deixa um campo "Contexto do change" para linkar proposal/specs; curto o bastante para ser preenchido de verdade.
Alternativas consideradas: checklist longo detalhando cada gate separadamente (rejeitado: fadiga de checklist, vira clique automático).

### 3. Amarração na DoD como referência, não duplicação

Rationale: duplicar a lista na docs/07 criaria duas fontes para divergir; uma linha de referência mantém o template como fonte única do checklist.
Alternativas consideradas: copiar o checklist para dentro da docs/07 (rejeitado: divergência futura garantida).

## Risks / Trade-offs

- [Risco] Checklist virar clique automático sem leitura → Mitigação: itens objetivos e condicionais (C2/C3 só exige ação se houve mudança de camada); revisão no Verify continua obrigatória.
- [Trade-off] Nenhum relevante (docs puros, sem comportamento executável).
