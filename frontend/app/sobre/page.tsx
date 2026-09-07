import type { Metadata } from "next";
import { AboutPage } from "@/features/about/AboutPage";

export const metadata: Metadata = {
  title: "Sobre a clínica — Newestetica",
  description:
    "Conheça a história da clínica da Fabiana Rosa: estética avançada com acolhimento.",
};

export default function SobrePage() {
  return <AboutPage />;
}
