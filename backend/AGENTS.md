# Backend AGENTS.md — Newestetica

> Regras específicas para qualquer IA que trabalhe no backend.
> Este arquivo complementa o `AGENTS.md` da raiz. Em caso de conflito, o da raiz vence.

---

## 1. Como começar

Antes de qualquer alteração no backend:

1. Leia o `AGENTS.md` da raiz
2. Leia `docs/product/00-visao-do-produto.md`
3. Leia `docs/architecture/02-arquitetura.md`
4. Leia `docs/security/03-seguranca.md`
5. Leia `docs/architecture/04-decisoes-tecnicas.md`
6. Só então trabalhe no código

---

## 2. Responsabilidade do Backend

O backend é responsável por:

- Regras de negócio
- Persistência
- Autenticação e autorização (Keycloak + 2FA)
- Exposição de API para o frontend
- Integridade e segurança dos dados

O backend está em **desenvolvimento ativo** desde a liberação do Épico 4 (validação com a Fabiana em 2026-09-19): os contratos vivem em `contracts/` e o primeiro módulo real é o de **Agendamento** (`backend/src/scheduling/`). Cada módulo SHALL seguir Clean Architecture com TDD estrito por camada — Domain → Application → Infrastructure → Presentation, cada camada só começando com a anterior testada e verde (`docs/engineering/07-workflow-de-engenharia.md` §15).

---

## 3. Stack e restrições

- NestJS
- PostgreSQL
- Monolito modular
- TypeScript
- Keycloak + 2FA
- Repository Pattern + Data Mapper

---

## 4. Organização obrigatória

Cada módulo deve seguir, preferencialmente:

- `domain/`
- `application/`
- `infrastructure/`
- `presentation/`

A organização segue **Clean Architecture** — a regra de dependência é obrigatória:

- `domain/` não importa nada fora de `domain/` (sem framework, sem ORM, sem HTTP);
- `application/` depende somente de `domain/`;
- `infrastructure/` implementa interfaces definidas em `domain/`, nunca o inverso;
- `presentation/` depende de `application/`.

Bounded contexts principais:

- Identidade e Acesso
- Catálogo
- Agendamento
- Pacientes
- Atendimento / Histórico
- Financeiro Básico

---

## 5. Regras técnicas obrigatórias

- Clean Architecture: `domain/` não importa nada externo; `application/` só depende de `domain/`; `infrastructure/` implementa interfaces do `domain/`; `presentation/` depende de `application/`
- Usar Repository Pattern
- Usar Data Mapper (evitar Active Record)
- Manter baixo acoplamento entre módulos
- Regras de negócio não devem depender do NestJS ou do ORM
- Testes unitários com meta > 80% de cobertura
- Quality gates obrigatórios (lint, typecheck, testes, build)

---

## 6. Segurança

- Autenticação via Keycloak
- 2FA obrigatório no painel admin
- Nunca hardcodar segredos
- Validar todas as entradas
- Respeitar consentimento de fotos
- Não armazenar dados sensíveis desnecessários no MVP

Ver detalhes em `docs/security/03-seguranca.md`.

---

## 7. O que NÃO fazer

- Não implementar módulo do backend fora da ordem TDD por camada (`docs/engineering/07-workflow-de-engenharia.md` §15)
- Não criar microserviços
- Não acoplar módulos entre si de forma forte
- Não colocar regras de negócio na camada de infraestrutura
- Não ignorar o fluxo OpenSpec

---

## 8. Referências

- `AGENTS.md` (raiz)
- `docs/architecture/02-arquitetura.md`
- `docs/security/03-seguranca.md`
- `docs/architecture/04-decisoes-tecnicas.md`
