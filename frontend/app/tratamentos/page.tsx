import type { Metadata } from "next";
import { CatalogPage } from "@/features/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Catálogo de tratamentos — Newestetica",
  description:
    "Conheça os tratamentos com explicação clara, no seu ritmo e sem pressão.",
};

export default function TratamentosPage() {
  return <CatalogPage />;
}
