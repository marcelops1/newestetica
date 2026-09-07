# 01 — Persona e UX 40+ — Newestetica

> **Fonte oficial da persona e das diretrizes de experiência.** Este documento define para quem o produto é feito e como a interface deve se comportar para esse público. Toda decisão de UX, tom de voz, tipografia, hierarquia visual e microcopy deve respeitar este arquivo.

---

## 1. Objetivo deste documento

Garantir que qualquer pessoa ou IA que trabalhe no frontend ou em conteúdos do Newestetica entenda profundamente:

- Quem é a paciente ideal
- Quais são suas motivações e medos
- Como ela prefere ser tratada
- Quais princípios de UX são obrigatórios para o público 40–60 anos
- Como a skill **UI/UX Pro Max** deve ser aplicada neste projeto

---

## 2. Persona Principal — A Paciente

### Nome fictício de referência

**Mariana, 48 anos**

### Perfil

Mulher entre 40 e 60 anos, ativa, preocupada com a própria imagem e que deseja envelhecer de forma natural e elegante. Não busca transformação radical. Busca se sentir bem consigo mesma.

### Motivações principais

- **Rejuvenescimento natural** — manter a beleza sem perder a identidade
- **Autoestima** — sentir-se confiante no dia a dia
- **Correção específica** — tratar pontos que realmente a incomodam
- **Prevenção** — cuidar agora para envelhecer melhor

### Medos e objeções

| Medo | O que ela pensa |
| ------ | ----------------- |
| Artificialidade | "Não quero ficar com cara de plástica" |
| Dor | "Será que dói muito?" |
| Preço | "Será que vou ter surpresa no valor?" |
| Resultados exagerados | "E se eu ficar irreconhecível?" |
| Privacidade | "Minhas fotos e dados vão ficar expostos?" |

### Como ela se informa e decide

- Valoriza **depoimentos reais** e resultados de outras mulheres da mesma faixa etária
- Prefere atendimento **próximo e humanizado**
- Pesquisa antes de decidir
- Precisa se sentir acolhida e segura, sem pressão

### O que ela não gosta

- Linguagem infantilizada ou excessivamente "meninina"
- Promessas milagrosas
- Interfaces poluídas, com letras pequenas ou baixo contraste
- Processos longos e confusos no celular
- Sensação de ser "mais uma" em uma esteira de atendimento

---

## 3. Persona Secundária — A Profissional

### Fabiana Rosa

Proprietária e responsável técnica da clínica.

**O que ela precisa do sistema:**

- Simplicidade operacional
- Controle da agenda e dos slots
- Visão clara das pacientes e do histórico
- Um sistema que transmita profissionalismo e acolhimento (reforçando a marca dela)

---

## 4. Diretrizes de Tom de Voz

| Aspecto | Diretriz |
| --------- | ---------- |
| **Tom geral** | Acolhedor, caloroso e empático |
| **Linguagem** | Clara, respeitosa e adulta |
| **O que evitar** | Infantilização, exagero, pressão comercial, jargão técnico desnecessário |
| **Como falar de resultados** | Honestidade + naturalidade. Nunca prometer transformação radical |
| **Como falar de procedimentos** | Explicar de forma acessível, incluindo o que esperar (conforto, tempo, cuidados) |

**Exemplos de tom correto:**

- "Resultados naturais que respeitam a sua essência"
- "Cuidado personalizado, no seu tempo"
- "Informação clara para você decidir com segurança"

**Exemplos de tom incorreto:**

- "Fique 10 anos mais jovem!"
- "Acabe com as rugas de uma vez"
- "Oferta imperdível só hoje"

---

## 5. Princípios de UX para o público 40–60

### 5.1 Mobile-first (obrigatório)

A maioria das pacientes acessará pelo celular. Todas as telas devem nascer pensadas primeiro para mobile e depois evoluir para desktop.

### 5.2 Legibilidade e conforto visual

- Tamanho de fonte base generoso (mínimo 16–18px no corpo de texto)
- Bom contraste (WCAG AA no mínimo, preferencialmente AAA em textos importantes)
- Espaçamento generoso entre elementos
- Evitar blocos longos de texto corrido
- Hierarquia visual clara (títulos, subtítulos, corpo)

### 5.3 Redução de carga cognitiva

- Fluxos curtos e objetivos
- Uma ação principal por tela sempre que possível
- Linguagem simples
- Feedback claro em cada etapa (especialmente no agendamento)

### 5.4 Segurança psicológica

- Informações transparentes sobre procedimentos e valores
- Nunca esconder informações importantes
- Permitir que a paciente avance no seu ritmo
- Evitar contadores regressivos, pressão ou urgência artificial

### 5.5 Confiança e prova social

- Depoimentos reais
- Fotos de antes e depois (somente com consentimento)
- Destaque para a figura da Fabiana Rosa como profissional de confiança
- Linguagem que transmite cuidado e competência

### 5.6 Acessibilidade

- Navegação por teclado
- Textos alternativos em imagens
- Contraste adequado
- Áreas de toque generosas (mínimo 44x44px)

---

## 6. Aplicação da skill UI/UX Pro Max

Toda implementação visual de frontend **deve** considerar a skill **UI/UX Pro Max** em conjunto com este documento.

### Prioridades ao usar a skill

1. Respeitar a persona e os medos descritos neste arquivo
2. Manter o tom acolhedor e empático
3. Garantir mobile-first e legibilidade
4. Priorizar clareza e redução de ansiedade
5. Manter o visual clean e suave (referência Ever/Body)

### O que a skill NÃO deve fazer neste projeto

- Criar interfaces "jovens demais" ou excessivamente modernas/agressivas
- Usar microinterações excessivas que distraiam
- Priorizar estética em detrimento da legibilidade e do conforto

---

## 7. Diretrizes específicas por tipo de tela

| Tipo de tela | Prioridade principal |
| -------------- | ---------------------- |
| **Home** | Transmitir acolhimento + confiança em poucos segundos |
| **Catálogo de procedimentos** | Clareza + redução de medo (o que é, o que esperar) |
| **Antes e Depois** | Prova real + consentimento visível |
| **Agendamento** | Fluxo curto, claro e sem ansiedade |
| **Depoimentos** | Proximidade e identificação |
| **Painel admin** | Eficiência e clareza operacional (público diferente) |

---

## 8. Regras absolutas de UX neste projeto

1. Nunca usar fonte pequena demais no corpo de texto.
2. Nunca criar fluxos longos e confusos no mobile.
3. Nunca usar linguagem que prometa resultados milagrosos ou artificiais.
4. Nunca exibir fotos de antes/depois sem deixar claro que houve consentimento.
5. Nunca priorizar "efeitos visuais" em detrimento da legibilidade e do conforto.
6. Sempre perguntar: "Isso reduz ou aumenta a ansiedade da Mariana (48 anos)?"

---

## 9. Referências cruzadas

- Visão de produto: `docs/product/00-visao-do-produto.md`
- Arquitetura: `docs/architecture/02-arquitetura.md`
- Segurança e privacidade: `docs/security/03-seguranca.md`
- Decisões técnicas: `docs/architecture/04-decisoes-tecnicas.md`
- Regras do frontend: `frontend/AGENTS.md`
