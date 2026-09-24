import type { Post as PostRecord } from "../../../../generated/prisma/client";
import { Post } from "../../../domain/entities/post.entity";

/* `publishedAt` é DATE no banco e string AAAA-MM-DD no contrato/domínio — a conversão
   acontece aqui, na fronteira do detalhe de persistência. */
export function toPostDomain(record: PostRecord): Post {
  return Post.restore({
    id: record.id,
    title: record.title,
    excerpt: record.excerpt,
    category: record.category,
    content: [...record.content],
    publishedAt: record.publishedAt.toISOString().slice(0, 10),
  });
}
