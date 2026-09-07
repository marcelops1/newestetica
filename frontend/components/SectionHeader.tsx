type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <p className="inline-block rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary-hover">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-ink-secondary sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
