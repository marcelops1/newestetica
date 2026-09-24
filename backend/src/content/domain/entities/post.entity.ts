import { InvalidContent } from "../errors/errors";

export type PostProps = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  content: string[];
  publishedAt: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Post do blog: `id` é o slug público; `publishedAt` no formato do contrato (AAAA-MM-DD). */
export class Post {
  private constructor(private readonly props: PostProps) {}

  static create(props: PostProps): Post {
    Post.validate(props);
    return new Post({ ...props, content: [...props.content] });
  }

  static restore(snapshot: PostProps): Post {
    Post.validate(snapshot);
    return new Post({ ...snapshot, content: [...snapshot.content] });
  }

  private static validate(props: PostProps): void {
    if (props.id.trim().length === 0) {
      throw new InvalidContent("id (slug) não pode ser vazio");
    }
    if (props.title.trim().length === 0) {
      throw new InvalidContent("título não pode ser vazio");
    }
    if (props.excerpt.trim().length === 0) {
      throw new InvalidContent("resumo não pode ser vazio");
    }
    if (props.category.trim().length === 0) {
      throw new InvalidContent("categoria não pode ser vazia");
    }
    if (props.content.length === 0) {
      throw new InvalidContent("conteúdo não pode ser vazio");
    }
    for (const paragraph of props.content) {
      if (paragraph.trim().length === 0) {
        throw new InvalidContent("parágrafo não pode ser vazio");
      }
    }
    if (!ISO_DATE.test(props.publishedAt.trim())) {
      throw new InvalidContent(
        `data de publicação fora do formato AAAA-MM-DD: ${props.publishedAt}`,
      );
    }
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get excerpt(): string {
    return this.props.excerpt;
  }

  get category(): string {
    return this.props.category;
  }

  get content(): string[] {
    return this.props.content;
  }

  get publishedAt(): string {
    return this.props.publishedAt;
  }
}
