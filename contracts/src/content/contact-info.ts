import { z } from "zod";

/** Informações institucionais públicas (sempre fictícias nos mocks). */
export const ContactInfoSchema = z.object({
  whatsapp: z.string().min(1),
  whatsappHref: z.url(),
  hours: z.array(z.string().min(1)).min(1),
  address: z.array(z.string().min(1)).min(1),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
