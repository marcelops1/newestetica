## 1. Camada de dados (test-first)

- [x] 1.1 Escrever os testes de `getProcedureBySlug()` (slug válido retorna; inválido retorna indefinido) e verificar que falham sem a implementação
- [x] 1.2 Implementar `getProcedureBySlug()` sobre os mocks existentes e verificar que os testes da task 1.1 passam

## 2. Catálogo e detalhe (test-first)

- [x] 2.1 Escrever os testes da busca normalizada (acentos, caixa, vazio com mensagem acolhedora) e verificar que falham sem a implementação
- [ ] 2.2 Extrair `TreatmentCard` + `CategoryFilter` reutilizáveis sem mudar a home e verificar que a home renderiza idêntica
- [ ] 2.3 Implementar `/tratamentos` (lista + filtro + busca) e `/tratamentos/[slug]` (detalhe + 404 acolhedora + CTA via `BookingModal`) e verificar que os testes da task 2.1 passam

## 3. Verificação e backlog

- [ ] 3.1 Rodar todos os quality gates e revisar segurança (`security-and-hardening`: busca reflete entrada do usuário no DOM) e verificar que tudo passa
- [ ] 3.2 Atualizar `docs/product/08-backlog-produto.md` (Catálogo conforme resultado; Agendamento refletindo modal + `submitBookingRequest` prontos) e verificar consistência com o implementado
