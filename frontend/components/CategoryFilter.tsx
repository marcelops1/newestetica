import { TREATMENT_CATEGORIES } from "@/lib/data";
import type { TreatmentCategory } from "@/lib/types";

export const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  facial: "Facial",
  corporal: "Corporal",
  rejuvenescimento: "Rejuvenescimento",
};

export type CategoryFilterValue = TreatmentCategory | "todos";

type CategoryFilterProps = {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  label: string;
};

export function CategoryFilter({ value, onChange, label }: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="mb-10 flex flex-wrap justify-center gap-2"
    >
      {(["todos", ...TREATMENT_CATEGORIES] as const).map((category) => {
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
            {category === "todos" ? "Todos" : CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </div>
  );
}
