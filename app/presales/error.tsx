"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, buttonPrimaryClass } from "./_components/ui";

// Without this boundary, any thrown error anywhere under /presales — most
// commonly a Server Action's validation throw (`throw new Error("...")`,
// used throughout adminActions.ts) — fell through to Next's built-in default
// error UI: a bare "Application error: a server-side exception has occurred
// (see the server logs for more information)" with nothing actionable for
// whoever's actually looking at the screen. This shows the real message
// instead, plus a retry, in the same visual language as the rest of the
// admin tool. `reset()` re-renders the segment that threw, same as a page
// refresh would but without losing client-side state elsewhere on the page.
export default function PresalesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Presales error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <Card className="max-w-md text-center">
        <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle size={18} />
        </span>
        <h1 className="mb-2 text-lg font-semibold text-brand-dark">Bir şeyler ters gitti</h1>
        <p className="mb-4 text-sm text-text-muted">
          {error.message || "Beklenmedik bir hata oluştu."}
        </p>
        <button type="button" onClick={() => reset()} className={buttonPrimaryClass}>
          Tekrar dene
        </button>
        {error.digest && <p className="mt-3 text-[11px] text-text-muted/60">Referans: {error.digest}</p>}
      </Card>
    </div>
  );
}
