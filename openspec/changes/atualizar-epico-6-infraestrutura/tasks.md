## 1. Deploy real no backlog (UC 6.3.1)

- [x] 1.1 Reescrever fluxo, status e aceite do UC 6.3.1 (deploy manual Vercel CLI do frontend em produção, confirmado vivo; backend não implantado; automático/reproduzível como evolução futura), preservando o gatilho de segurança (exceção docs/07 §4: backlog sem comportamento executável; verificação por releitura + site em produção confirmado)

## 2. UC do pre-commit + tabela-resumo

- [x] 2.1 Adicionar o UC 6.1.2 (ator desenvolvedor/IA, fluxo commit→hook→corrige/barra, status Concluído com referência ao change arquivado) e atualizar a tabela-resumo (Épico 6: 4 UCs; total 38 UCs; status geral refletindo frontend em produção manual) (exceção docs/07 §4: sem comportamento executável; verificação por releitura + contagem de UCs)

## 3. Verificação e registro

- [ ] 3.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (backlog sem segredos nem dados: registrar não-aplicabilidade dos gatilhos §7 e checar que nenhum segredo ou dado real entrou no texto) e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [ ] 3.2 Registrar `verification.md` (exceção docs/07 §4: sem comportamento executável; verificação por releitura)
