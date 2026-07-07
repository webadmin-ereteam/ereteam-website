const BADGE_COLORS: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-brand-primary/10 text-brand-primary",
  pink: "bg-brand-magenta/10 text-brand-magenta",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
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
      className={`rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
    >
      {children}
    </div>
  );
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
        <h1 className="text-[26px] font-semibold tracking-tight text-brand-dark">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const inputClass =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm text-text-body transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15";

export const labelClass = "mb-1.5 block text-sm font-medium text-text-body";

export const buttonPrimaryClass =
  "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-primary to-brand-magenta px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-primary/20 transition-opacity hover:opacity-90";

export const buttonSecondaryClass =
  "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-text-body transition-colors hover:border-brand-primary hover:bg-brand-primary/[0.03] hover:text-brand-primary";
