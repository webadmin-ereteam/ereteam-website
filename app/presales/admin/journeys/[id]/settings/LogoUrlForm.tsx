"use client";

import { useFormState } from "react-dom";
import { uploadCompanyLogoFromUrl } from "@/lib/presales/adminActions";
import { inputClass, buttonSecondaryClass } from "../../../../_components/ui";
import { SubmitButton } from "../../../../_components/SubmitButton";

// The only logo form that uses useFormState instead of a plain throw — see
// the comment on uploadCompanyLogoFromUrl for why. A failed fetch shows
// right here under the input instead of crashing into the error.tsx boundary.
export function LogoUrlForm({ journeyId, hasExistingLogo }: { journeyId: string; hasExistingLogo: boolean }) {
  const [state, formAction] = useFormState(uploadCompanyLogoFromUrl.bind(null, journeyId), { error: null });

  return (
    <form action={formAction} className="mt-2">
      <div className="flex gap-2">
        <input
          name="logoUrl"
          type="url"
          required
          placeholder="veya link ile: https://firma.com/logo.png"
          className={`${inputClass} flex-1`}
        />
        <SubmitButton className={buttonSecondaryClass} pendingLabel="Alınıyor...">
          {hasExistingLogo ? "Değiştir" : "Al"}
        </SubmitButton>
      </div>
      {state.error && <p className="mt-1.5 text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
