## 1. Destinos do menu (test-first)

- [x] 1.1 Escrever o teste do mapa de destinos (Resultados→`/antes-depois`, Depoimentos→`/depoimentos`, Diferenciais→`/#diferenciais`, Tratamentos→`/tratamentos`, A Clínica→`/sobre`) e constatar que falha no `NAV_ITEMS` atual
- [x] 1.2 Extrair `NAV_ITEMS` para módulo puro co-localizado, atualizar os dois destinos e verificar que o teste da task 1.1 passa, com Header (desktop + drawer) consumindo a mesma fonte via `next/link`

## 2. Verificação e backlog

- [ ] 2.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test` com cobertura, `build`) e revisar segurança contra `docs/security/03-seguranca.md` (navegação pura, sem entrada de usuário/auth/dados de paciente/integração: registrar não-aplicabilidade dos gatilhos §7) e verificar que tudo passa
- [ ] 2.2 Avaliar `docs/product/08-backlog-produto.md` e atualizar somente se algum status de navegação estiver incorreto, verificando consistência
