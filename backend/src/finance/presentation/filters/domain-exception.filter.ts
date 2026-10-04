import { DomainExceptionFilter as SharedDomainExceptionFilter } from "../../../shared/http/domain-exception.filter";

/* Subclasse fina local: Financeiro só tem erro de validação de janela, que o default
   do kernel já mapeia para 422; a subclasse preserva o padrão de filtro por módulo
   (substituição em mudanças futuras, se houver novo status) e o binding local. */
export class DomainExceptionFilter extends SharedDomainExceptionFilter {}
