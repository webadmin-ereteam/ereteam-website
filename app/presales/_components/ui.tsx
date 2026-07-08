// Low-opacity tint + a thin matching ring, instead of a flat pastel fill —
// solid bg-emerald-100/bg-amber-100 pill backgrounds read closer to a
// consumer/toy app than an enterprise SaaS panel. This is the same
// "outlined tint" language Linear/Stripe use for status pills.
const BADGE_COLORS: Record<string, string> = {
  gray: "bg-gray-500/[0.06] text-gray-600 ring-1 ring-inset ring-gray-500/10",
  blue: "bg-brand-primary/[0.07] text-brand-primary ring-1 ring-inset ring-brand-primary/15",
  pink: "bg-brand-magenta/[0.07] text-brand-magenta ring-1 ring-inset ring-brand-magenta/15",
  green: "bg-emerald-500/[0.08] text-emerald-700 ring-1 ring-inset ring-emerald-500/15",
  amber: "bg-amber-500/[0.09] text-amber-700 ring-1 ring-inset ring-amber-500/20",
};

export function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: keyof typeof BADGE_COLORS;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_COLORS[color]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_10px_-4px_rgba(16,24,40,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

// Small uppercase field label used above textareas/inputs whose meaning
// isn't obvious from placeholder text alone (which vanishes once you start
// typing) — e.g. the several free-text fields on a stage card.
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-text-muted">{children}</p>;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 border-b border-gray-200/70 pb-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-brand-dark">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const inputClass =
  "rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-text-body transition-colors focus:border-brand-primary focus:outline-none focus:ring-[3px] focus:ring-brand-primary/10";

export const labelClass = "mb-1.5 block text-sm font-medium text-text-body";

// A solid brand-primary fill, not the blue→magenta gradient — a two-color
// diagonal gradient repeated on every button read as more "template/candy"
// than premium. One deep, confident color reads calmer and more enterprise.
export const buttonPrimaryClass =
  "inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-[0_4px_12px_-4px_rgba(26,111,168,0.4)] transition-all hover:bg-[#155d8c] hover:shadow-[0_6px_16px_-4px_rgba(26,111,168,0.45)]";

export const buttonSecondaryClass =
  "inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-text-body transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/[0.03] hover:text-brand-primary";
