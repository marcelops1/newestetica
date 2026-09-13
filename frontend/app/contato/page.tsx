import type { Metadata } from "next";
import { ContactPage } from "@/features/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contato — Newestetica",
  description:
    "Fale com a clínica no seu ritmo — deixe sua dúvida por e-mail ou WhatsApp e receba uma resposta com calma.",
};

export default function ContatoPage() {
  return <ContactPage />;
}
