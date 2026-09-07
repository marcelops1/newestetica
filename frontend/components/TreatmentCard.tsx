import type { Procedure } from "@/lib/types";
import { CATEGORY_LABELS } from "./CategoryFilter";

type TreatmentCardProps = {
  item: Procedure;
  onBook: (treatment?: string) => void;
};

export function TreatmentCard({ item, onBook }: TreatmentCardProps) {
  return (
    <li className="flex flex-col justify-between rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-md">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-hover">
            {CATEGORY_LABELS[item.categories[0]]}
          </span>
          <span className="text-xs font-medium text-ink-muted">
            {item.duration}
          </span>
        </div>
        <h3 className="font-display text-2xl font-normal text-ink">
          {item.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {item.description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-ink-muted">Avaliação prévia inclusa</span>
        <button
          type="button"
          onClick={() => onBook(item.name)}
          className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary-hover hover:text-primary"
        >
          Agendar
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}
