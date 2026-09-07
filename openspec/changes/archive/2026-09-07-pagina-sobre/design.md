## Context

Ver `proposal.md` (Why). Ponto de partida: padrão de página estabelecido pelo catálogo (`app/tratamentos/`, `features/catalog/`, Header/Footer/`BookingModal` reusados). Restrição: conteúdo fictício, mesmo padrão, sem backend.

## Goals / Non-Goals

**Goals:**

- Página institucional consistente com home e catálogo, zero componente novo genérico.

**Non-Goals:**

- Fotos reais; novas seções na home; contratos; alterar o modal.

## Decisions

### 1. `features/about/` espelhando `features/catalog/`

Rationale: mesmo padrão (página + Header/Footer/modal com estado local) facilita revisão e manutenção.
Alternativas consideradas: colocar na home (rejeitado: não é rota própria do MVP) e nova arquitetura (rejeitado: sem motivo).

### 2. Conteúdo fictício inline no componente da página

Rationale: textos institucionais estáticos e pequenos; mock em `lib/` só se faria sentido com reuso ou troca por API — aqui não há.
Alternativas consideradas: mocks em `lib/` (rejeitado: indireção sem benefício) e buscar da API (rejeitado: sem backend).

### 3. Reuso total de Header/Footer/CTAButton/BookingModal

Rationale: consistência visual e zero duplicação de comportamento (modal já testado).
Alternativas consideradas: variantes próprias (rejeitado: divergência gratuita).

## Risks / Trade-offs

- [Risco] Texto fictício soar genérico na validação → Mitigação: tom da persona aplicado; Fabiana ajusta no aceite.
- [Trade-off] Sem foto da profissional por enquanto → Aceito: bloco local como nas demais páginas, até foto com consentimento.
