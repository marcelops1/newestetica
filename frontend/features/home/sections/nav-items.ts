export type NavItem = {
  href: string;
  label: string;
};

export const NAV_DESTINATIONS = {
  tratamentos: "/tratamentos",
  diferenciais: "/#diferenciais",
  resultados: "/antes-depois",
  depoimentos: "/depoimentos",
  sobre: "/sobre",
} as const;

export const NAV_ITEMS: readonly NavItem[] = [
  { href: NAV_DESTINATIONS.tratamentos, label: "Tratamentos" },
  { href: NAV_DESTINATIONS.diferenciais, label: "Diferenciais" },
  { href: NAV_DESTINATIONS.resultados, label: "Resultados" },
  { href: NAV_DESTINATIONS.depoimentos, label: "Depoimentos" },
  { href: NAV_DESTINATIONS.sobre, label: "A Clínica" },
];
