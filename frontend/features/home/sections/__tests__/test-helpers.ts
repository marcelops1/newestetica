import type { NavItem } from "../nav-items";

export function hrefFor(items: readonly NavItem[], label: string) {
  return items.find((item) => item.label === label)?.href;
}
