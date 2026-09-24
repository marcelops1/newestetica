import { InvalidContent } from "../errors/errors";

export type TestimonialProps = {
  id: string;
  quote: string;
  author: string;
  context: string;
};

/** Depoimento público: todo item é público por desenho do contrato (sem flag de visibilidade). */
export class Testimonial {
  private constructor(private readonly props: TestimonialProps) {}

  static create(props: TestimonialProps): Testimonial {
    Testimonial.validate(props);
    return new Testimonial({ ...props });
  }

  static restore(snapshot: TestimonialProps): Testimonial {
    Testimonial.validate(snapshot);
    return new Testimonial({ ...snapshot });
  }

  private static validate(props: TestimonialProps): void {
    if (props.id.trim().length === 0) {
      throw new InvalidContent("id não pode ser vazio");
    }
    if (props.quote.trim().length === 0) {
      throw new InvalidContent("relato não pode ser vazio");
    }
    if (props.author.trim().length === 0) {
      throw new InvalidContent("autoria não pode ser vazia");
    }
    if (props.context.trim().length === 0) {
      throw new InvalidContent("contexto não pode ser vazio");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get quote(): string {
    return this.props.quote;
  }

  get author(): string {
    return this.props.author;
  }

  get context(): string {
    return this.props.context;
  }
}
