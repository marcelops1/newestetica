export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/tratamentos", label: "Tratamentos" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/antes-depois", label: "Resultados" },
  { href: "/depoimentos", label: "Depoimentos" },
  { href: "/sobre", label: "A Clínica" },
];
