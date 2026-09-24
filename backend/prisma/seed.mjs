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
} finally {
  await client.end();
}
