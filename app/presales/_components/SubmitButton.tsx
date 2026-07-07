"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

export function SubmitButton({
  children,
  pendingLabel = "Kaydediliyor...",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);
  const [justSaved, setJustSaved] = useState(false);

  // Flash a "Kaydedildi" confirmation on the pending -> idle transition, i.e.
  // right after the server action actually finishes — not just on click.
  useEffect(() => {
    if (wasPending.current && !pending) {
      setJustSaved(true);
      const timeout = setTimeout(() => setJustSaved(false), 1800);
      wasPending.current = pending;
      return () => clearTimeout(timeout);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <button type="submit" disabled={pending} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? (
        pendingLabel
      ) : justSaved ? (
        <span className="inline-flex items-center gap-1.5">
          <Check size={14} /> Kaydedildi
        </span>
      ) : (
        children
      )}
    </button>
  );
}
