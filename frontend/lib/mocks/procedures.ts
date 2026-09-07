/* DADOS 100% FICTÍCIOS — nunca colocar dados reais de pacientes aqui. */
import type { Procedure } from "../types";

export const proceduresMock: Procedure[] = [
  {
    id: "toxina-botulinica-preventiva",
    name: "Toxina Botulínica Preventiva",
    description:
      "Suavização estratégica de rugas dinâmicas no terço superior do rosto, mantendo a expressividade natural.",
    duration: "Aprox. 45 min",
    categories: ["facial", "rejuvenescimento"],
  },
  {
    id: "bioestimulador-de-colageno",
    name: "Bioestimulador de Colágeno",
    description:
      "Estímulo gradual da firmeza dérmica, sem criar volume artificial.",
    duration: "Aprox. 60 min",
    categories: ["facial", "rejuvenescimento"],
  },
  {
    id: "limpeza-de-pele",
    name: "Limpeza de pele",
    description: "Cuidado suave para uma pele fresca e bem cuidada.",
    duration: "Cerca de 60 minutos",
    categories: ["facial"],
  },
  {
    id: "hidratacao-facial",
    name: "Hidratação facial",
    description: "Reposição de viço com conforto do início ao fim.",
    duration: "Cerca de 50 minutos",
    categories: ["facial"],
  },
  {
    id: "protocolo-corporal",
    name: "Protocolo Corporal",
    description: "Cuidado personalizado para contorno e bem-estar do corpo.",
    duration: "Cerca de 60 minutos",
    categories: ["corporal"],
  },
  {
    id: "massagem-relaxante",
    name: "Massagem relaxante",
    description: "Um momento de pausa para corpo e mente.",
    duration: "Cerca de 60 minutos",
    categories: ["corporal", "rejuvenescimento"],
  },
];
