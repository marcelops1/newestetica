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
    category: "Cuidados diários",
    content: [
      "A partir dos 40, é natural que a pele produza menos colágeno e demore um pouco mais para se renovar. Nada disso é motivo para alarme — é um processo tranquilo e que responde muito bem a cuidados consistentes.",
      "Os pilares continuam os mesmos de sempre: limpeza suave, hidratação diária e proteção solar. O que muda é a atenção aos detalhes, como áreas mais finas ao redor dos olhos e da boca.",
      "O mais importante é lembrar que não existe pressa: pequenos gestos repetidos com carinho valem mais do que rotinas intensas e difíceis de manter.",
      "Na próxima avaliação, vale conversar sobre o que já funciona para você — cada rotina nasce do que você já tem, nunca do zero.",
    ],
    publishedAt: "2026-08-20",
  },
  {
    id: "o-que-esperar-da-primeira-avaliacao",
    title: "O que esperar da primeira avaliação",
    excerpt: "Como funciona a conversa inicial, sem compromisso e sem pressão.",
    category: "Primeira visita",
    content: [
      "A primeira avaliação é uma conversa. Antes de qualquer procedimento, entendemos o que você gostaria de cuidar, seu histórico e o seu ritmo — no papel de quem escuta, não de quem vende.",
      "Você sai da conversa com um plano claro por escrito: o que indicamos, por quê, quantas sessões costumam levar e qual o investimento. Sem letras miúdas e sem obrigações.",
      "Se preferir pensar com calma antes de decidir, tudo bem. Boas decisões nascem de tempo e informação — e a porta fica aberta.",
      "Dúvidas antes da visita? Elas são bem-vindas e podem ser enviadas pelo contato do site.",
    ],
    publishedAt: "2026-08-27",
  },
  {
    id: "hidratacao-alem-do-verao",
    title: "Hidratação que vai além do verão",
    excerpt: "Por que a pele pede água em todas as estações, com leveza.",
    category: "Cuidados diários",
    content: [
      "É comum associar hidratação ao calor, mas a pele perde água em todas as estações — inclusive no ar-condicionado do dia a dia.",
      "O segredo está na constância: um bom hidratante usado todos os dias vale mais do que intensões de fim de semana.",
      "Ativos como ácido hialurônico ajudam a reter água na pele com suavidade. Seu uso pode ser combinado em uma avaliação rápida e sem mistério.",
    ],
    publishedAt: "2026-09-03",
  },
  {
    id: "o-que-e-um-protocolo-personalizado",
    title: "O que é um protocolo personalizado",
    excerpt: "Entenda por que cada plano nasce de uma conversa, nunca de uma prateleira.",
    category: "Primeira visita",
    content: [
      "Protocolo personalizado é o nome do cuidado que considera a sua pele, o seu momento de vida e o que você espera — e não uma lista pronta que vale para todo mundo.",
      "Na prática, ele combina etapas simples em um calendário realista, com intervalos respeitosos e expectativas honestas sobre o resultado.",
      "Nada de promessas de transformação radical: o objetivo é você se reconhecer no espelho, com a sua essência intacta.",
      "Quer saber como um protocolo seria para você? A avaliação inicial é o melhor caminho — e é sem compromisso.",
    ],
    publishedAt: "2026-09-10",
  },
];
