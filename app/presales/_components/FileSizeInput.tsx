"use client";

import { useState } from "react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/presales/fileUpload";

export function FileSizeInput({
  name,
  required,
  className,
  accept,
}: {
  name: string;
  required?: boolean;
  className?: string;
  accept?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <input
        type="file"
        name={name}
        required={required}
        accept={accept}
        className={className}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.size > MAX_UPLOAD_BYTES) {
            e.target.value = "";
            setError(`Dosya çok büyük (maksimum ${MAX_UPLOAD_LABEL}) — lütfen daha küçük bir dosya seçin.`);
          } else {
            setError(null);
          }
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
