COMPOSE := docker compose -f infra/docker/docker-compose.yml

.DEFAULT_GOAL := help
.PHONY: help up down logs build restart ps db-shell

help: ## Lista os comandos disponíveis
	@echo "Comandos do monorepo Newestetica:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

up: ## Sobe o stack (postgres, keycloak, backend) até os healthchecks passarem
	$(COMPOSE) up -d --wait

down: ## Derruba os serviços e remove órfãos (volumes são preservados)
	$(COMPOSE) down --remove-orphans

logs: ## Segue os logs de todos os serviços (Ctrl+C para sair)
	$(COMPOSE) logs -f

build: ## Reconstrói as imagens (frontend não entra no compose; backend sim)
	$(COMPOSE) build

restart: ## Reinicia os serviços no lugar
	$(COMPOSE) restart

ps: ## Mostra o estado dos serviços
	$(COMPOSE) ps

db-shell: ## Abre o psql no postgres (ex.: make db-shell ARGS="-c 'select 1'")
	$(COMPOSE) exec postgres psql -U $${POSTGRES_USER:-newestetica} -d $${POSTGRES_DB:-newestetica} $(ARGS)
