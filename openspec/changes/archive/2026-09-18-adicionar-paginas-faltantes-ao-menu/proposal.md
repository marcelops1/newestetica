# Change: adicionar-paginas-faltantes-ao-menu

## Why

As páginas `/blog`, `/contato` e `/orcamento` existem e funcionam em produção, mas não têm nenhum acesso no Header nem no rodapé — só são alcançáveis digitando a URL. Isso esconde justamente as páginas que reduzem a ansiedade da paciente (Orçamento responde ao medo de preço; Contato ao medo de burocracia; Blog educa e gera confiança, conforme `docs/product/01-persona-e-ux-40+.md`) e desperdiça a ação de conversão (Orçamento).

## What Changes

- **Rodapé:** coluna Navegação ganha Blog (`/blog`) e Contato (`/contato`), após Diferenciais, no mesmo padrão `next/link` — o rodapé comporta mais itens sem prejudicar a UX.
- **Header:** navegação desktop segue com os mesmos 5 itens (menu curto: mobile-first, público 40+); ganha CTA fantasma "Pedir Orçamento" (`/orcamento`) ao lado do WhatsApp/CTA primário, no desktop e no drawer — conversão visível, sem entupir o menu.
- **Dados:** `NAV_DESTINATIONS` ganha `blog`, `contato` e `orcamento`; rodapé e CTA referenciam as constantes (sem literais duplicados, mesmo padrão estabelecido).
- Explicitamente fora: backend, novas páginas, mudança visual além dos acréscimos, alteração de ordem/labels existentes, drawer além do CTA extra.

## Capabilities

### New Capabilities

- Nenhuma (navegação de páginas existentes, sem capability nova).

### Modified Capabilities

- `public-site-structure`: MODIFIED — requirement "Header com navegação e drawer mobile" (CTA de Orçamento) e requirement "Diferenciais, depoimentos, CTA final e rodapé no padrão do protótipo" (Blog e Contato na coluna de navegação).

## Impact

- `frontend/features/home/sections/Header.tsx` (CTA fantasma), `footer-nav-items.ts` (2 entradas), `nav-items.ts` (3 constantes), testes de destinos (mapa do rodapé vai a 6 labels; constantes cobertas).
- Sem impacto em backend, `contracts/`, `shared/`, mocks ou dados (navegação pura, sem dado sensível).
