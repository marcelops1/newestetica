## 1. 404 escopada do catálogo (test-first)

- [ ] 1.1 Escrever o teste de contrato de `app/tratamentos/not-found.tsx` (o módulo existe e seu export default é função) e constatar que falha (`Cannot find module`, precedente do change `pagina-blog`)
- [ ] 1.2 Criar `app/tratamentos/not-found.tsx` no padrão do blog (badge, título e texto acolhedores em PT, CTA de volta ao catálogo para `/tratamentos` via `next/link`, 44px+, tom 40+) e verificar que o teste da task 1.1 passa

## 2. Verificação e backlog

- [ ] 2.1 Provar em runtime (`next build` + `next start` + `curl` em `/tratamentos/slug-inexistente`, com `/blog/slug-inexistente` como controle) que a 404 acolhedora renderiza com copy e CTA, rodar quality gates (`lint`, `format`, `typecheck`, `test` com cobertura, `build`) e revisar segurança contra `docs/security/03-seguranca.md` (página estática sem entrada de usuário/auth/dados de paciente/integração: registrar não-aplicabilidade dos gatilhos §7) e verificar que tudo passa
- [ ] 2.2 Avaliar `docs/product/08-backlog-produto.md` (atualizar somente se algum status estiver incorreto) e atualizar a linha de `docs/product/05-estado-atual.md` sobre a 404 do catálogo, que esta correção torna obsoleta, verificando consistência
