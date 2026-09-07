## 1. Diagramas C4 (mudança sem comportamento — exceção docs/07 §4 registrada aqui)

> Exceção aplicável: este change cria só documentação, sem alterar comportamento executável; não há ciclo RED necessário. A verificação de cada task é leitura/revisão do artefato.

- [ ] 1.1 Escrever `docs/architecture/c1-context.md` (Mermaid + atores + externos real/planejado + nota de manutenção) e verificar que o diagrama renderiza e nada fora de `docs/02`/`docs/04` aparece
- [ ] 1.2 Escrever `docs/architecture/c2-container.md` (Mermaid + contêineres real/planejado + nota de manutenção) e verificar que só há os contêineres previstos em `docs/02`
- [ ] 1.3 Escrever `docs/architecture/c3-component.md` (Mermaid do frontend real + placeholder normatizado do backend + nota de manutenção) e verificar que cada pasta citada existe no repositório

## 2. Verificação e proposta de gatilho

- [ ] 2.1 Revisar os 3 arquivos contra tom, português e links, e verificar que `openspec validate` passa
- [ ] 2.2 Propor (sem aplicar) o texto do novo gatilho na Definition of Done (`docs/07` §6) e verificar que ele não referencia skill inexistente
