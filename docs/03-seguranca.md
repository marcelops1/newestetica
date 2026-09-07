# 03 — Segurança — Newestetica

> **Fonte oficial de segurança e privacidade.** Este documento define as regras obrigatórias de segurança, proteção de dados e privacidade do Newestetica. Nenhuma implementação pode ignorar este arquivo.

---

## 1. Objetivo deste documento

Garantir que qualquer IA ou desenvolvedor entenda e aplique:

- Os princípios de segurança do projeto
- As regras de autenticação e autorização
- O tratamento de dados pessoais e sensíveis
- As obrigações de consentimento (especialmente fotos de antes/depois)
- As práticas que são proibidas

---

## 2. Princípios de Segurança

1. **Segurança desde o desenho** (Security by Design)
2. **Privacidade desde o desenho** (Privacy by Design)
3. **Princípio do menor privilégio**
4. **Defesa em profundidade**
5. **Minimização de dados** (coletar apenas o necessário)
6. **Segredos nunca no código**

---

## 3. Autenticação e Autorização

### Decisão atual

- **Keycloak** como Identity Provider
- **2FA** obrigatório para usuários do painel administrativo

### Regras

- Todo acesso ao painel admin deve ser autenticado via Keycloak
- 2FA é obrigatório para Fabiana e equipe de recepção
- Sessões devem expirar de forma segura
- Tokens devem ser tratados com cuidado (nunca expostos no frontend de forma insegura)
- Autorização deve ser baseada em papéis/permissões (RBAC)

### Papéis iniciais previstos

| Papel | Descrição |
|-------|-----------|
| `admin` | Fabiana Rosa (acesso total) |
| `reception` | Equipe de recepção (acesso operacional limitado) |

> A implementação detalhada de roles e permissões será definida nas specs do OpenSpec.

---

## 4. Proteção de Dados (LGPD)

### Dados tratados no MVP

- Dados cadastrais de pacientes (nome, contato, etc.)
- Dados de agendamento
- Histórico simples de atendimentos
- Fotos de antes e depois (com consentimento)
- Dados de usuários do painel

### Regras obrigatórias

- Coletar apenas o mínimo necessário
- Informar a finalidade do uso dos dados
- Permitir que a paciente tenha clareza sobre o uso de suas informações
- Não armazenar dados sensíveis de saúde no início (conforme decisão de produto)
- Preparar o sistema para atender direitos do titular (acesso, correção, exclusão) no futuro

### Dados sensíveis de saúde

No MVP **não** armazenamos prontuário médico completo nem dados clínicos sensíveis aprofundados. O histórico é simples e operacional.

---

## 5. Consentimento de Fotos (Antes e Depois)

Esta é uma regra **crítica** do domínio.

### Regras obrigatórias

- Nenhuma foto de antes/depois pode ser exibida publicamente sem **consentimento explícito** da paciente
- O consentimento deve ser registrado
- O sistema deve permitir gerenciar (conceder/revogar) esse consentimento
- No frontend com mocks, o comportamento de consentimento já deve ser respeitado (simulado)

### Princípio

Se não houver consentimento claro, a foto **não aparece**.

---

## 6. Segredos e Configurações Sensíveis

### Regras absolutas

- Nunca commitar senhas, tokens, chaves de API ou credenciais
- Nunca colocar segredos em Dockerfile, docker-compose, código ou documentação pública
- Usar variáveis de ambiente
- Arquivos `.env` devem estar no `.gitignore`
- Em produção, usar mecanismos seguros de gestão de segredos

---

## 7. Segurança no Frontend

- Não armazenar tokens de forma insegura
- Evitar expor dados sensíveis no HTML ou no JavaScript
- Validar entradas do usuário
- Proteger rotas do painel admin
- Usar HTTPS em todos os ambientes relevantes
- Evitar XSS e práticas inseguras de manipulação do DOM

---

## 8. Segurança no Backend

- Validar todas as entradas
- Usar parâmetros preparados / proteção contra SQL Injection
- Aplicar autenticação e autorização em todas as rotas protegidas
- Registrar eventos de segurança relevantes (login, falhas, etc.)
- Retornar erros sem expor detalhes internos sensíveis
- Seguir o princípio do menor privilégio no acesso ao banco

---

## 9. Segurança na Comunicação

- HTTPS obrigatório em ambientes de staging e produção
- Cookies de sessão/token devem ser configurados de forma segura (HttpOnly, Secure, SameSite conforme o caso)
- CORS configurado de forma restritiva

---

## 10. O que é explicitamente proibido

1. Hardcode de senhas ou tokens
2. Exibir fotos de pacientes sem consentimento
3. Armazenar dados sensíveis desnecessários no MVP
4. Liberar o painel admin sem autenticação
5. Logar dados sensíveis em texto puro
6. Ignorar o 2FA para usuários administrativos
7. Confiar apenas em validação do frontend

---

## 11. Segurança e a estratégia Frontend-first

Mesmo usando dados mockados na fase inicial:

- Os mocks devem respeitar as regras de consentimento
- Não usar dados reais de pacientes em desenvolvimento
- Não colocar informações sensíveis reais em arquivos de mock

---

## 12. Evolução futura de segurança

Itens que poderão ser aprofundados depois do MVP:

- Gestão completa de consentimentos
- Trilhas de auditoria mais ricas
- Políticas mais granulares de autorização
- Criptografia em repouso de campos específicos
- Processos formais de resposta a incidentes

---

## 13. Referências cruzadas

- Visão de produto: `docs/00-visao-do-produto.md`
- Persona e UX: `docs/01-persona-e-ux-40+.md`
- Arquitetura: `docs/02-arquitetura.md`
- Decisões técnicas: `docs/04-decisoes-tecnicas.md`
- Estado atual: `docs/05-estado-atual.md`
- Regras para IAs: `AGENTS.md`
