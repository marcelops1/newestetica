import type { Metadata } from "next";
import { ResultsPage } from "@/features/results/ResultsPage";

export const metadata: Metadata = {
  title: "Antes e depois — Newestetica",
  description:
    "Resultados reais com consentimento das pacientes: estética natural e acolhedora na clínica da Fabiana Rosa.",
};

export default function AntesDepoisPage() {
  return <ResultsPage />;
}
