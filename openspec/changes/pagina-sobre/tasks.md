## 1. Página Sobre (mudança sem comportamento novo — exceção docs/07 §4 registrada aqui)

> Exceção aplicável: página estática de apresentação com componentes e modal já testados; não há comportamento novo testável em unidade. A verificação de cada task é render + revisão + gates.

- [x] 1.1 Implementar `/sobre` (`app/sobre/page.tsx` + `features/about/`) com hero, história, formação/valores, confiança e CTA via `BookingModal`, e verificar no dev que a rota retorna 200 com o conteúdo
- [x] 1.2 Revisar textos contra persona e tom, conferir mobile-first e 44px, e verificar que nenhum dado real de pessoa aparece

## 2. Verificação e backlog

- [x] 2.1 Rodar quality gates e revisar segurança (página estática sem entrada de usuário: registrar não-aplicabilidade) e verificar que tudo passa
- [x] 2.2 Atualizar `docs/product/08-backlog-produto.md` (Sobre + linha do Épico 1) e verificar consistência
