import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TreatmentDetail } from "@/features/catalog/TreatmentDetail";
import { getProcedureBySlug, getProcedures } from "@/lib/data";

export function generateStaticParams() {
  return getProcedures().map((item) => ({ slug: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = getProcedureBySlug((await params).slug);
  return {
    title: item ? `${item.name} — Newestetica` : "Tratamento não encontrado",
  };
}

export default async function TratamentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getProcedureBySlug((await params).slug);
  if (!item) notFound();
  return <TreatmentDetail item={item} />;
}
