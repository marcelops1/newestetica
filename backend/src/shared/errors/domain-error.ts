/* Kernel técnico compartilhado (docs/architecture/02-arquitetura.md §3, exceção do
   kernel): a base é plumbing puro — cada módulo mantém o SEU union de códigos e a sua
   subclasse fina, preservando a precisão de tipo e a independência do domínio. */
export class DomainError<Code extends string> extends Error {
  constructor(
    readonly code: Code,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
