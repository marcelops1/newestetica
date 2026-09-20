import { z } from "zod";

/** Post do blog. Espelha `Post` dos mocks (conteúdo em parágrafos). */
export const PostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.string().min(1),
  content: z.array(z.string().min(1)).min(1),
  publishedAt: z.iso.date(),
});

export type Post = z.infer<typeof PostSchema>;
