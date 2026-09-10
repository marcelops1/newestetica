import type { Metadata } from "next";
import { TestimonialsPage } from "@/features/testimonials/TestimonialsPage";

export const metadata: Metadata = {
  title: "Depoimentos — Newestetica",
  description:
    "O que pacientes ilustrativas dizem sobre o atendimento acolhedor da clínica da Fabiana Rosa.",
};

export default function DepoimentosPage() {
  return <TestimonialsPage />;
}
