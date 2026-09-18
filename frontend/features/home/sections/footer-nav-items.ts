import { NAV_DESTINATIONS, NAV_ITEMS, type NavItem } from "./nav-items";

const FOOTER_DESTINATIONS = [
  NAV_DESTINATIONS.tratamentos,
  NAV_DESTINATIONS.resultados,
  NAV_DESTINATIONS.depoimentos,
  NAV_DESTINATIONS.diferenciais,
] as const;

export const FOOTER_NAV_ITEMS: readonly NavItem[] = FOOTER_DESTINATIONS.flatMap(
  (href) => NAV_ITEMS.filter((item) => item.href === href),
);
