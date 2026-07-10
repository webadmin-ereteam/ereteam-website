"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

export function SubmitButton({
  children,
  pendingLabel = "Kaydediliyor...",
  className,
  formAction,
  formNoValidate,
  confirmMessage,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  formNoValidate?: boolean;
  // Native confirm() prompt before the form actually submits — for
  // destructive actions (delete). Cancelling stops the click from
  // submitting at all.
  confirmMessage?: string;
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
    <button
      type="submit"
      disabled={pending}
      formAction={formAction}
      formNoValidate={formNoValidate}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
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
