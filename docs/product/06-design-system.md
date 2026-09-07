# 06 — Design System — Newestetica

> **Fonte oficial do Design System visual.** Este documento define cores, tipografia, espaçamentos, componentes e princípios de interface. Toda implementação de frontend deve seguir este arquivo e a referência visual aprovada.

---

## 1. Objetivo

Garantir consistência visual e de experiência em todo o produto, com foco no público de mulheres 40–60 anos: clareza, suavidade, legibilidade e confiança.

---

## 2. Referência visual oficial

Foi aprovado um protótipo visual (HTML) como base do site público.

Esse protótipo define:

- Hierarquia de seções
- Tom visual
- Componentes principais
- Comportamento mobile
- Padrão de CTAs e formulários

Qualquer implementação de frontend deve se aproximar dessa referência, adaptando para Next.js + Tailwind + componentes reutilizáveis.

---

## 3. Princípios visuais

| Princípio | Aplicação |
| ----------- | ----------- |
| Clareza | Hierarquia óbvia, pouco ruído |
| Suavidade | Cantos moderados, sombras leves |
| Conforto | Tipografia generosa, bom contraste, espaçamento amplo |
| Confiança | Cores sóbrias, sem gritos promocionais |
| Naturalidade | Evitar saturado demais e efeitos agressivos |

---

## 4. Paleta de cores

### Neutros

- Background: `#FAFAF9`
- Surface / cards: `#FFFFFF`
- Border sutil: `#E7E5E4`
- Texto principal: `#1C1917`
- Texto secundário: `#57534E`
- Texto muted: `#A8A29E`

### Marca

- Primary: `#9A7B6B`
- Primary hover: `#866A5C`
- Primary soft: `#F5EDE8`

### Apoio

- Success: `#5F8F6B` / soft `#EAF2EC`
- Warning: `#C2A15A` / soft `#F9F5EC`
- Danger: `#B85C5C` / soft `#F8ECEC`
- Info: `#6B7F9A` / soft `#EEF2F6`

### Regras

- Preferir fundos claros e texto escuro
- Primary nunca deve “gritar”
- Evitar pretos e brancos absolutos em excesso

---

## 5. Tipografia

### Famílias

- Display / títulos: `Cormorant Garamond`
- Corpo: `Inter`

### Escala (mobile-first)

- xs: 12–13px
- sm: 14px
- base: 16–18px (corpo mínimo no mobile)
- lg: 18–20px
- xl: 22–24px
- 2xl: 28–32px
- 3xl: 36–40px
- 4xl: 44–48px (hero desktop)

### Regras

- Line-height generoso no texto corrido (1.5–1.7)
- Títulos com peso moderado e tracking leve
- Nunca usar corpo abaixo de 16px no mobile

---

## 6. Espaçamento

Escala base: 4 / 8

Valores comuns: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96

### Regras práticas

- Entre seções: 64–96px (desktop), 40–64px (mobile)
- Padding mobile: 16–20px
- Padding desktop: 32–48px
- Espaço interno de cards: 12–24px

---

## 7. Radius, sombra e borda

- Radius sm: 8px
- Radius md: 12px
- Radius lg: 16–20px
- Border: 1px sólido `#E7E5E4`
- Shadow sm / md: leves, discretas

Evitar sombras pesadas e efeitos excessivos.

---

## 8. Componentes prioritários

### Navegação

- Header sticky
- Menu desktop
- Menu mobile
- Logo + CTA principal

### Conteúdo

- Hero
- Badge / chip
- Section header
- Service card
- Feature card
- Testimonial card
- Before/After (com consentimento visível)
- CTA block
- Footer

### Formulários

- Input
- Select
- Textarea
- Button (primary / secondary / ghost)
- Modal de agendamento

---

## 9. Estrutura de seções do site público (base aprovada)

1. Header
2. Hero
3. Simulador / quiz de objetivos
4. Tratamentos (com filtros)
5. Resultados (antes/depois + consentimento)
6. Diferenciais
7. Depoimentos
8. CTA final de agendamento
9. Footer

Essa estrutura é a base do frontend público na fase de mocks.

---

## 10. Regras de UX específicas (40+)

- Mobile-first obrigatório
- Contraste adequado
- Textos claros e sem jargão desnecessário
- Evitar pressão comercial e urgência artificial
- Consentimento de imagens sempre explícito
- Fluxos curtos e previsíveis
- Feedback visual calmo e legível

---

## 11. O que evitar

- Cores neon ou rosa choque
- Animações excessivas
- Carrosséis obrigatórios
- Fontes muito finas em textos longos
- Layouts densos no mobile
- Linguagem milagrosa ou infantilizada

---

## 12. Implementação no frontend

- Stack visual: Next.js + Tailwind CSS
- Tokens de cor, tipografia e spacing devem ser centralizados
- Componentes devem ser reutilizáveis
- Dados iniciais: mockados
- Aproximar o máximo possível da referência visual aprovada

---

## 13. Referências cruzadas

- Persona e UX: `docs/product/01-persona-e-ux-40+.md`
- Arquitetura: `docs/architecture/02-arquitetura.md`
- Estado atual: `docs/product/05-estado-atual.md`
- Regras gerais: `AGENTS.md`
- Frontend: `frontend/AGENTS.md`
