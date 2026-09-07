# Frontend AGENTS.md — Newestetica

> Regras específicas para qualquer IA que trabalhe no frontend.
> Este arquivo complementa o `AGENTS.md` da raiz. Em caso de conflito, o da raiz vence.

---

## 1. Como começar

Antes de qualquer alteração no frontend:

1. Leia o `AGENTS.md` da raiz
2. Leia `docs/00-visao-do-produto.md`
3. Leia `docs/01-persona-e-ux-40+.md`
4. Leia `docs/02-arquitetura.md`
5. Só então trabalhe no código

---

## 2. Responsabilidade do Frontend

O frontend cobre:

- Site público (Home, Sobre, Catálogo, Antes/Depois, Depoimentos, Agendamento, Orçamento, Contato, Blog)
- Painel administrativo
- Experiência mobile-first
- Dados mockados na fase atual

O frontend **não** contém regras de negócio reais. Ele apresenta e consome dados (hoje mockados, depois via API).

---

## 3. Stack e restrições

- Next.js (App Router)
- TypeScript
- Mobile-first obrigatório
- UI/UX Pro Max obrigatório em tarefas visuais
- Seguir estritamente `docs/01-persona-e-ux-40+.md`

---

## 4. Regras de UX (obrigatórias)

- Público principal: mulheres 40–60 anos
- Tom: acolhedor, caloroso e empático
- Legibilidade alta (fonte generosa, bom contraste)
- Fluxos curtos e claros
- Nunca usar linguagem milagrosa ou infantilizada
- Nunca exibir fotos de antes/depois sem refletir consentimento
- Priorizar redução de ansiedade da paciente

---

## 5. Estratégia atual: Mocks

- Todos os dados são mockados nesta fase
- Os mocks devem simular o comportamento real o mais fielmente possível
- Não usar dados reais de pacientes
- Preparar o código para trocar mocks por API real com baixo impacto

---

## 6. Organização recomendada

- `app/` → rotas e páginas
- `components/` → componentes reutilizáveis
- `features/` → funcionalidades por domínio
- `lib/` → utilitários e configurações
- `styles/` → design system e tokens

---

## 7. O que NÃO fazer

- Não implementar regras de negócio no frontend
- Não antecipar backend
- Não criar interfaces “jovens demais” ou agressivas
- Não ignorar mobile-first
- Não pular o fluxo OpenSpec quando houver mudança de comportamento

---

## 8. Referências

- `AGENTS.md` (raiz)
- `docs/01-persona-e-ux-40+.md`
- `docs/02-arquitetura.md`
- `docs/03-seguranca.md`
