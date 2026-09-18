## 1. Destinos do rodapé (test-first)

- [ ] 1.1 Escrever o teste do mapa de destinos do rodapé (Tratamentos→`/tratamentos`, Resultados→`/antes-depois`, Depoimentos→`/depoimentos`, Diferenciais→`/#diferenciais`) e constatar que falha contra os itens atuais do Footer
- [ ] 1.2 Extrair os itens do rodapé para módulo puro co-localizado referenciando as constantes canônicas compartilhadas, migrar os 4 links para `next/link` e verificar que o teste da task 1.1 passa, que o teste do Header segue verde e que o lint não acusa `no-html-link-for-pages`

## 2. Verificação e backlog

- [ ] 2.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test` com cobertura, `build`) e revisar segurança contra `docs/security/03-seguranca.md` (navegação pura, sem entrada de usuário/auth/dados de paciente/integração: registrar não-aplicabilidade dos gatilhos §7) e verificar que tudo passa
- [ ] 2.2 Avaliar `docs/product/08-backlog-produto.md` e atualizar somente se algum status de navegação estiver incorreto, verificando consistência
