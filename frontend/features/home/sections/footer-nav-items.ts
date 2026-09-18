import { NAV_DESTINATIONS, type NavItem } from "./nav-items";

export const FOOTER_NAV_ITEMS: readonly NavItem[] = [
  { href: NAV_DESTINATIONS.tratamentos, label: "Tratamentos" },
  { href: NAV_DESTINATIONS.resultados, label: "Resultados" },
  { href: NAV_DESTINATIONS.depoimentos, label: "Depoimentos" },
  { href: NAV_DESTINATIONS.diferenciais, label: "Diferenciais" },
];
