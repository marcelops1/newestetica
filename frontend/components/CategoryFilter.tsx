import { TREATMENT_CATEGORIES } from "@/lib/data";
import type { TreatmentCategory } from "@/lib/types";

export const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  facial: "Facial",
  corporal: "Corporal",
  rejuvenescimento: "Rejuvenescimento",
};

export type CategoryFilterValue = TreatmentCategory | "todos";

type CategoryFilterProps<T extends string = CategoryFilterValue> = {
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Abas opcionais derivadas (ex.: categorias do blog). Padrão: categorias de tratamento. */
  options?: readonly T[];
  /** Rótulos opcionais por aba. Padrão: rótulos de tratamento. */
  labels?: Record<string, string>;
};

const DEFAULT_OPTIONS: readonly CategoryFilterValue[] = [
  "todos",
  ...TREATMENT_CATEGORIES,
];

export function CategoryFilter<T extends string = CategoryFilterValue>({
  value,
  onChange,
  label,
  options,
  labels,
}: CategoryFilterProps<T>) {
  const resolvedOptions = (options ?? DEFAULT_OPTIONS) as readonly T[];
  const resolvedLabels: Record<string, string> = labels ?? { ...CATEGORY_LABELS };
  return (
    <div
      role="group"
      aria-label={label}
      className="mb-10 flex flex-wrap justify-center gap-2"
    >
      {resolvedOptions.map((category) => {
        const active = value === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={active}
            className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-ink-secondary hover:bg-primary-soft"
            }`}
          >
            {category === "todos"
              ? "Todos"
              : (resolvedLabels[category] ?? category)}
          </button>
        );
      })}
    </div>
  );
}
