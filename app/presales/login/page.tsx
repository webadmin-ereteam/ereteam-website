import Image from "next/image";
import { loginAdmin } from "@/lib/presales/sessionActions";
import { Card, inputClass, labelClass, buttonPrimaryClass } from "../_components/ui";
import { SubmitButton } from "../_components/SubmitButton";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-dark to-[#0f2a3d] px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-primary/[0.18] blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-magenta/[0.14] blur-[110px]" />
      <Card className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/logos/ereteam-logo.png"
            alt="Ereteam"
            width={175}
            height={100}
            className="h-11 w-auto object-contain"
            priority
          />
          <div>
            <h1 className="text-lg font-semibold text-brand-dark">Presales Admin</h1>
            <p className="text-sm text-text-muted">Devam etmek için giriş yap</p>
          </div>
        </div>

        <form action={loginAdmin} className="space-y-4">
          <input type="hidden" name="next" value={searchParams.next ?? "/presales/admin"} />
          <div>
            <label className={labelClass}>Kullanıcı Adı</label>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input name="username" required autoFocus className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Şifre</label>
            <input name="password" type="password" required className={`${inputClass} w-full`} />
          </div>
          {searchParams.error && (
            <p className="text-sm text-red-600">Kullanıcı adı veya şifre hatalı.</p>
          )}
          <SubmitButton className={`${buttonPrimaryClass} w-full justify-center`} pendingLabel="Giriş yapılıyor...">
            Giriş Yap
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
