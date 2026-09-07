# Verificação de segurança — corrigir-navegacao-header

Revisão contra `docs/security/03-seguranca.md`. Data: 2026-09-07.

## Gatilhos de docs/07 §7

**Não se aplica, sem gatilho.** Troca mecânica de destinos de links (`<a>` → `next/link`, âncoras com prefixo de rota): sem entrada de usuário, sem autenticação, sem dado de paciente, sem integração, sem segredos.

## Checagens executadas

- Links externos (WhatsApp) mantêm `target="_blank"` + `rel="noopener noreferrer"`.
- Nenhum dado dinâmico não-confiável em href (todos os destinos são literais).
- Drawer mantém `aria-expanded` e operação por teclado.
