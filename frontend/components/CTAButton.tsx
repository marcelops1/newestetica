import type { ReactNode } from "react";

type CTAButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

const BASE =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors";

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
  ghost:
    "border border-border bg-surface text-ink-secondary hover:text-ink hover:border-primary/40",
} as const;

export function CTAButton({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
}: CTAButtonProps) {
  const styles = `${BASE} ${VARIANTS[variant]} ${className}`;
  if (href) {
    return (
      <a href={href} onClick={onClick} className={styles}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={styles}>
      {children}
    </button>
  );
}
