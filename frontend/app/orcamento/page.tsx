import type { Metadata } from "next";
import { QuotePage } from "@/features/quote/QuotePage";

export const metadata: Metadata = {
  title: "Orçamento personalizado — Newestetica",
  description:
    "Peça um orçamento personalizado com calma e sem pressão — a Fabiana responde com clareza, no seu tempo.",
};

export default function OrcamentoPage() {
  return <QuotePage />;
}
