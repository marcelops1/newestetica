/* DADOS 100% FICTÍCIOS — nunca colocar dados reais de pacientes aqui. */
import type { Post, Slot } from "../types";

export const slotsMock: Slot[] = [
  {
    id: "slot-1",
    start: "2026-09-14T09:00:00-03:00",
    durationMinutes: 60,
    available: true,
  },
  {
    id: "slot-2",
    start: "2026-09-14T10:30:00-03:00",
    durationMinutes: 60,
    available: true,
  },
  {
    id: "slot-3",
    start: "2026-09-14T14:00:00-03:00",
    durationMinutes: 50,
    available: false,
  },
];

export const postsMock: Post[] = [
  {
    id: "cuidados-com-a-pele-aos-40",
    title: "Cuidados com a pele a partir dos 40",
    excerpt: "O que muda na pele com o tempo e como cuidar com suavidade.",
    publishedAt: "2026-08-20",
  },
  {
    id: "o-que-esperar-da-primeira-avaliacao",
    title: "O que esperar da primeira avaliação",
    excerpt: "Como funciona a conversa inicial, sem compromisso e sem pressão.",
    publishedAt: "2026-08-27",
  },
];
