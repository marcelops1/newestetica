## 1. Base Next.js no monorepo

- [x] 1.1 Inicializar o app Next.js (App Router + TypeScript + Tailwind) na pasta `frontend/` dentro do workspace pnpm e verificar que `dev` inicia sem erros
- [x] 1.2 Criar a estrutura `app/`, `components/`, `features/`, `lib/`, `styles/` e verificar que cada pasta possui um marcador de propósito (ex.: README curto ou index)
- [x] 1.3 Configurar scripts `dev`, `lint`, `format`, `typecheck`, `test`, `build` e verificar que `build` de produção completa sem erros

## 2. Tokens do Design System

- [x] 2.1 Centralizar cores, tipografia, espaçamentos, radius, sombras e bordas em `styles/` (CSS variables + tema Tailwind) e verificar que nenhum valor literal divergente permanece nos arquivos iniciais
- [x] 2.2 Aplicar base tipográfica (Cormorant Garamond + Inter, corpo mínimo 16px, contraste AA) e verificar manualmente no mobile que textos de corpo têm ao menos 16px

## 3. Estrutura das 9 seções do site público

- [x] 3.1 Criar os componentes de seção (Header, Hero, Simulador/quiz, Tratamentos, Resultados, Diferenciais, Depoimentos, CTA final, Footer) com conteúdo placeholder e verificar que a página compõe as nove na ordem aprovada
- [x] 3.2 Aplicar mobile-first, áreas de toque 44x44px e uma ação principal por fluxo, e verificar navegando só pelo celular que nada quebra nem exige ajuda
- [x] 3.3 Revisar todos os textos contra o tom (acolhedor, sem milagre, sem urgência) e verificar que nenhum gatilho de pressão ou promessa radical permanece

## 4. Camada de dados mockados

- [x] 4.1 Criar interfaces por entidade + mocks tipados (procedimentos, depoimentos, antes/depois com consentimento, slots, posts) e verificar que todas as seções renderizam só com mocks
- [x] 4.2 Garantir que nenhum mock contém dado real (nomes, fotos, contatos fictícios) e verificar por inspeção dos arquivos que tudo é identificavelmente fictício
- [x] 4.3 Garantir que itens sem consentimento não são exibidos e verificar com um item mockado sem consentimento que ele não aparece em nenhuma seção

## 5. Verificação e validação

- [x] 5.1 Rodar todos os quality gates (lint, format, typecheck, testes, build) e verificar que todos passam
- [ ] 5.2 Preparar o checklist de validação visual por seção (telas, fluxos, textos, experiência) e verificar com a Fabiana Rosa, registrando aprovações e ajustes
