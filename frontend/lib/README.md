# lib/ — Utilitários, tipos e camada de dados

Interfaces por entidade, mocks tipados e o ponto único de acesso a dados.
Regra: componentes consomem as interfaces daqui; trocar mocks pela API real significa alterar só esta camada.
Nunca colocar dados reais de pacientes aqui (ver `docs/03-seguranca.md`).
