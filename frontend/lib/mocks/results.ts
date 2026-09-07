/* DADOS 100% FICTÍCIOS — nunca colocar dados reais de pacientes aqui. */
import type { BeforeAfter } from "../types";

export const resultsMock: BeforeAfter[] = [
  {
    id: "resultado-1",
    title: "Bioestimulação com Rejuvenescimento Natural",
    summary:
      "Paciente ilustrativa com queixa de perda de firmeza e viço. Protocolo fictício de 2 sessões associado à hidratação profunda.",
    sessions: "2 sessões (intervalo de 30 dias)",
    recovery: "Imediato (sem downtime)",
    goal: "Firmeza e contorno sutil",
    hasConsent: true,
  },
  {
    id: "resultado-2",
    title: "Resultado ilustrativo 2",
    summary: "Caso fictício para composição da seção.",
    sessions: "1 sessão",
    recovery: "Imediato (sem downtime)",
    goal: "Viço e hidratação",
    hasConsent: true,
  },
  // Sem consentimento: nunca deve ser exibido (ver spec mock-data).
  {
    id: "resultado-3",
    title: "Resultado ilustrativo 3",
    summary: "Caso fictício sem consentimento.",
    sessions: "—",
    recovery: "—",
    goal: "—",
    hasConsent: false,
  },
];
