import { Client } from "pg";

/* Seed 100% FICTÍCIO — nunca colocar dado real aqui (docs/security/03-seguranca.md).
   Alinhado nominalmente aos mocks do frontend (frontend/lib/mocks/procedures.ts) e com
   um item INATIVO para exercitar a regra "leitura pública nunca retorna desativado".
   Usa `pg` direto (o cliente Prisma gerado é TS/CJS e não carrega sob o ESM nativo do
   Node sem toolchain extra); SQL parametrizado, upsert idempotente. */

const procedures = [
  {
    id: "toxina-botulinica-preventiva",
    name: "Toxina Botulínica Preventiva",
    description:
      "Suavização estratégica de rugas dinâmicas no terço superior do rosto, mantendo a expressividade natural.",
    duration: "Aprox. 45 min",
    categories: ["facial", "rejuvenescimento"],
    isActive: true,
  },
  {
    id: "bioestimulador-de-colageno",
    name: "Bioestimulador de Colágeno",
    description:
      "Estímulo gradual da firmeza dérmica, sem criar volume artificial.",
    duration: "Aprox. 60 min",
    categories: ["facial", "rejuvenescimento"],
    isActive: true,
  },
  {
    id: "limpeza-de-pele",
    name: "Limpeza de pele",
    description: "Cuidado suave para uma pele fresca e bem cuidada.",
    duration: "Cerca de 60 minutos",
    categories: ["facial"],
    isActive: true,
  },
  {
    id: "hidratacao-facial",
    name: "Hidratação facial",
    description: "Reposição de viço com conforto do início ao fim.",
    duration: "Cerca de 50 minutos",
    categories: ["facial"],
    isActive: true,
  },
  {
    id: "protocolo-corporal",
    name: "Protocolo Corporal",
    description: "Cuidado personalizado para contorno e bem-estar do corpo.",
    duration: "Cerca de 60 minutos",
    categories: ["corporal"],
    isActive: true,
  },
  {
    id: "massagem-relaxante",
    name: "Massagem relaxante",
    description: "Um momento de pausa para corpo e mente.",
    duration: "Cerca de 60 minutos",
    categories: ["corporal", "rejuvenescimento"],
    isActive: true,
  },
  {
    id: "protocolo-descontinuado",
    name: "Protocolo Descontinuado (exemplo fictício)",
    description:
      "Item fictício inativo para exercitar a regra de leitura pública só de ativos.",
    duration: "—",
    categories: ["facial"],
    isActive: false,
  },
];

/* Conteúdo público fictício, alinhado nominalmente aos mocks do frontend:
   `frontend/lib/mocks/testimonials.ts`, `frontend/lib/mocks/schedule.ts` (posts) e
   `frontend/lib/mocks/results.ts`. O caso SEM consentimento é intencional: existe para
   provar a exclusão na leitura pública ("nada sem consentimento é servido"). */
const testimonials = [
  {
    id: "depoimento-1",
    quote:
      "Eu tinha muito medo de ficar com o rosto artificial. Me explicaram tudo com paciência e o resultado ficou super delicado!",
    author: "Mariana S.",
    context: "Paciente ilustrativa",
  },
  {
    id: "depoimento-2",
    quote:
      "O atendimento é humano e sem aquela pressão para comprar pacotes desnecessários. Sinto total confiança no trabalho da equipe.",
    author: "Camila R.",
    context: "Paciente ilustrativa",
  },
  {
    id: "depoimento-3",
    quote:
      "Clínica impecável, pontual e muito profissional. O resultado ficou descansado, como eu queria.",
    author: "Patricia B.",
    context: "Paciente ilustrativa",
  },
  {
    id: "depoimento-4",
    quote:
      "Nunca me senti pressionada a fazer nada além do que eu queria. Acolhimento de verdade, do início ao fim.",
    author: "Cristina M.",
    context: "Paciente ilustrativa",
  },
  {
    id: "depoimento-5",
    quote:
      "A clínica explica cada etapa com carinho e sem pressa. Cheguei insegura e saí confiante.",
    author: "Helena D.",
    context: "Paciente ilustrativa",
  },
];

const posts = [
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
      "O segredo está na constância: um bom hidratante usado todos os dias vale mais do que intenções de fim de semana.",
      "Ativos como ácido hialurônico ajudam a reter água na pele com suavidade. Seu uso pode ser combinado em uma avaliação rápida e sem mistério.",
    ],
    publishedAt: "2026-09-03",
  },
  {
    id: "o-que-e-um-protocolo-personalizado",
    title: "O que é um protocolo personalizado",
    excerpt:
      "Entenda por que cada plano nasce de uma conversa, nunca de uma prateleira.",
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

const beforeAfterCases = [
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

/* Pacientes fictícios (nunca dado real — docs/security/03-seguranca.md §4/§11):
   nomes e telefones claramente ilustrativos, telefone com prefixo 5555, só ativos.
   Ids fixos (UUID v4 fictícios) para o upsert idempotente. */
const patients = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    fullName: "Paciente Ilustrativa Alfa",
    phone: "(11) 5555-0101",
    purpose: "Cadastro fictício para desenvolvimento (paciente ilustrativa)",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    fullName: "Paciente Ilustrativa Bravo",
    phone: "(11) 5555-0102",
    purpose: "Cadastro fictício para desenvolvimento (paciente ilustrativa)",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    fullName: "Paciente Ilustrativa Charlie",
    phone: "(11) 5555-0103",
    purpose: "Cadastro fictício para desenvolvimento (paciente ilustrativa)",
  },
];

/* Atendimentos fictícios (histórico operacional — nunca dado clínico):
   dois registros simples vinculados às pacientes ilustrativas acima (FK). */
const attendances = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    patientId: "00000000-0000-4000-8000-000000000101",
    summary: "Limpeza de pele realizada, sem intercorrências.",
    performedAt: "2026-08-12T14:30:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    patientId: "00000000-0000-4000-8000-000000000102",
    summary: "Hidratação facial realizada, pele bem tolerada.",
    performedAt: "2026-09-02T10:00:00.000Z",
  },
];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não configurada para o seed");
}

const client = new Client({ connectionString });
await client.connect();
try {
  for (const procedure of procedures) {
    await client.query(
      `INSERT INTO "Procedure" (id, name, description, duration, categories, "isActive")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         duration = EXCLUDED.duration,
         categories = EXCLUDED.categories,
         "isActive" = EXCLUDED."isActive"`,
      [
        procedure.id,
        procedure.name,
        procedure.description,
        procedure.duration,
        procedure.categories,
        procedure.isActive,
      ],
    );
  }
  const inactive = procedures.filter((p) => !p.isActive).length;
  console.log(
    `Seed do catálogo aplicado: ${procedures.length} procedimentos fictícios (${inactive} inativo).`,
  );

  for (const testimonial of testimonials) {
    await client.query(
      `INSERT INTO "Testimonial" (id, quote, author, context)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         quote = EXCLUDED.quote,
         author = EXCLUDED.author,
         context = EXCLUDED.context`,
      [
        testimonial.id,
        testimonial.quote,
        testimonial.author,
        testimonial.context,
      ],
    );
  }
  console.log(
    `Seed de depoimentos aplicado: ${testimonials.length} fictícios.`,
  );

  for (const post of posts) {
    await client.query(
      `INSERT INTO "Post" (id, title, excerpt, category, content, "publishedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         category = EXCLUDED.category,
         content = EXCLUDED.content,
         "publishedAt" = EXCLUDED."publishedAt"`,
      [
        post.id,
        post.title,
        post.excerpt,
        post.category,
        post.content,
        post.publishedAt,
      ],
    );
  }
  console.log(`Seed de posts aplicado: ${posts.length} fictícios.`);

  for (const beforeAfter of beforeAfterCases) {
    await client.query(
      `INSERT INTO "BeforeAfterCase" (id, title, summary, sessions, recovery, goal, "hasConsent")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         sessions = EXCLUDED.sessions,
         recovery = EXCLUDED.recovery,
         goal = EXCLUDED.goal,
         "hasConsent" = EXCLUDED."hasConsent"`,
      [
        beforeAfter.id,
        beforeAfter.title,
        beforeAfter.summary,
        beforeAfter.sessions,
        beforeAfter.recovery,
        beforeAfter.goal,
        beforeAfter.hasConsent,
      ],
    );
  }
  const withoutConsent = beforeAfterCases.filter((c) => !c.hasConsent).length;
  console.log(
    `Seed de antes/depois aplicado: ${beforeAfterCases.length} casos fictícios (${withoutConsent} sem consentimento — nunca servido publicamente).`,
  );

  for (const patient of patients) {
    await client.query(
      `INSERT INTO "Patient" (id, "fullName", phone, purpose, status, "updatedAt")
       VALUES ($1, $2, $3, $4, 'active', now())
       ON CONFLICT (id) DO UPDATE SET
         "fullName" = EXCLUDED."fullName",
         phone = EXCLUDED.phone,
         purpose = EXCLUDED.purpose,
         status = EXCLUDED.status,
         "updatedAt" = now()`,
      [patient.id, patient.fullName, patient.phone, patient.purpose],
    );
  }
  console.log(
    `Seed de pacientes aplicado: ${patients.length} fictícios (ilustrativos, só ativos).`,
  );

  for (const attendance of attendances) {
    await client.query(
      `INSERT INTO "Attendance" (id, "patientId", summary, "performedAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (id) DO UPDATE SET
         "patientId" = EXCLUDED."patientId",
         summary = EXCLUDED.summary,
         "performedAt" = EXCLUDED."performedAt",
         "updatedAt" = now()`,
      [
        attendance.id,
        attendance.patientId,
        attendance.summary,
        attendance.performedAt,
      ],
    );
  }
  console.log(
    `Seed de atendimentos aplicado: ${attendances.length} fictícios (histórico operacional, sem dado clínico).`,
  );
} finally {
  await client.end();
}
