/* DADOS 100% FICTÍCIOS — nunca colocar dados reais de pacientes aqui. */
import type { ContactInfo, QuizGoal, QuizRecommendation } from "../types";

export const quizGoalsMock: QuizGoal[] = [
  {
    id: "rejuvenescimento",
    title: "Firmeza e Linhas",
    short: "Estimular colágeno e suavizar linhas finas.",
  },
  {
    id: "manchas",
    title: "Manchas e Textura",
    short: "Uniformizar o tom da pele.",
  },
  {
    id: "contorno",
    title: "Contorno e Volume",
    short: "Definição leve com naturalidade.",
  },
  {
    id: "prevencao",
    title: "Prevenção e Glow",
    short: "Cuidado contínuo e viço.",
  },
];

export const quizRecommendationsMock: QuizRecommendation[] = [
  {
    goalId: "rejuvenescimento",
    protocol: "Bioestimulador de Colágeno + Suavização Preventiva",
    description:
      "Combinação indicada para firmeza gradual sem volume artificial.",
  },
  {
    goalId: "manchas",
    protocol: "Protocolo de Uniformização do Tom",
    description: "Cuidado sequencial para renovação e viço homogêneo.",
  },
  {
    goalId: "contorno",
    protocol: "Definição Sutil de Contorno",
    description: "Abordagem milimétrica focada na estrutura, sem exageros.",
  },
  {
    goalId: "prevencao",
    protocol: "Limpeza Profunda + Cuidado Preventivo",
    description: "Manutenção ideal para preservar a textura e o viço.",
  },
];

export const treatmentOptionsMock: string[] = [
  "Avaliação Geral",
  "Toxina Botulínica Preventiva",
  "Bioestimulador de Colágeno",
  "Limpeza de pele",
  "Protocolo Corporal",
  "Hidratação facial",
];

export const contactMock: ContactInfo = {
  whatsapp: "(00) 00000-0000",
  whatsappHref: "https://wa.me/5500000000000",
  hours: ["Segunda a Sexta: 08h às 19h", "Sábados: 08h às 13h"],
  address: ["Rua Ilustrativa, 000 — Sala 00", "Bairro Fictício, Cidade/UF"],
};
