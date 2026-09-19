## 1. Destinos canônicos novos (test-first)

- [x] 1.1 Escrever o teste das constantes (`blog`→`/blog`, `contato`→`/contato`, `orcamento`→`/orcamento`) e constatar que falha (`undefined` — constantes inexistentes em `NAV_DESTINATIONS`)
- [x] 1.2 Adicionar as 3 constantes a `NAV_DESTINATIONS` e verificar que o teste passa e os testes existentes de Header e rodapé seguem verdes

## 2. Blog e Contato no rodapé (test-first)

- [x] 2.1 Atualizar o teste de ordem do rodapé para os 6 labels (Tratamentos, Resultados, Depoimentos, Diferenciais, Blog, Contato) e constatar que falha (só 4 itens, sem Blog/Contato)
- [x] 2.2 Adicionar as entradas de Blog e Contato ao módulo do rodapé (hrefs via constantes, labels próprios) e verificar que o teste passa e que o runtime do bloco do rodapé contém `href="/blog"` e `href="/contato"`

## 3. CTA Pedir Orçamento no Header (test-first via runtime)

- [ ] 3.1 Escrever a verificação de runtime (o HTML servido deve conter `href="/orcamento"` no bloco do header, desktop e drawer) e constatar que falha (href ausente no header atual)
- [ ] 3.2 Adicionar o CTA fantasma "Pedir Orçamento" (`CTAButton` com `href`, `variant="ghost"`, desktop + drawer) e verificar que a checagem de runtime passa, que o drawer segue operável e que lint/typecheck passam

## 4. Verificação e backlog

- [ ] 4.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test` com cobertura, `build`) e revisar segurança contra `docs/security/03-seguranca.md` (navegação pura: sem entrada de usuário/auth/dados de paciente/integração; copy nova só em labels/CTA sem promessas — registrar não-aplicabilidade dos gatilhos §7) e verificar que tudo passa
- [ ] 4.2 Avaliar `docs/product/08-backlog-produto.md` e atualizar somente se algum status estiver incorreto, verificando consistência
