## 1. Base visual (CTAs e header)

- [x] 1.1 Estender `CTAButton` com variante primária taupe (`primary`/`primary-hover`, texto branco) e fantasma do protótipo, e verificar no build que nenhum CTA da home usa mais `ink`/`preto`
- [x] 1.2 Recompor o Header (logo + tagline, navegação desktop, WhatsApp fantasma + CTA primário, drawer mobile com `aria-expanded`) e verificar por teclado que o drawer abre, percorre e fecha

## 2. Hero e simulador

- [x] 2.1 Recompor o Hero em duas colunas (badge, título com acento, CTAs, métricas, card visual + flutuante) e verificar no mobile que empilha sem quebra e no desktop que fica lado a lado
- [x] 2.2 Recompor o Quiz (4 objetivos + caixa de recomendação via mocks) e verificar que escolher um objetivo destaca a opção e exibe a recomendação com CTA

## 3. Seções de conteúdo

- [x] 3.1 Recompor Tratamentos (abas de filtro derivadas dos mocks + cards com categoria, duração e ação) e verificar que filtrar mostra só a categoria com a aba ativa indicada por `aria-pressed`
- [x] 3.2 Recompor Resultados (badge de consentimento, comparador acessível com blocos locais, painel do caso + CTA) e verificar por teclado que o comparador varia de 5% a 95% e que item sem consentimento não renderiza
- [x] 3.3 Recompor Diferenciais (4 numerados), Depoimentos (estrelas + iniciais fictícias), CTA final em `primary-soft` e rodapé em 4 colunas, e verificar que todos os textos mantêm o tom aprovado

## 4. Mocks e modal

- [x] 4.1 Estender os mocks (objetivos + recomendações, categorias, campos do caso, opções do modal, contatos fictícios) somente por adição e verificar com testes que abas nunca ficam órfãs e que nada real foi introduzido
- [x] 4.2 Implementar o modal de agendamento (pré-seleção de tratamento, envio mockado → sucesso, fechamento triplo com foco gerenciado) e verificar que nenhum dado sai do navegador e que o Escape fecha devolvendo o foco

## 5. Verificação

- [x] 5.1 Rodar todos os quality gates (lint, format, typecheck, testes, build) e verificar que todos passam
- [x] 5.2 Revisar a home lado a lado com `docs/prototypes/home-nano-banana.html` e verificar paridade visual seção por seção, registrando diferenças aceitas (ex.: blocos locais no lugar de fotos)
