import { getEffectiveAdminCredentials } from "@/lib/presales/auth";
import { updateAdminCredentials } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

export default async function AdminAccountPage() {
  const credentials = await getEffectiveAdminCredentials();

  return (
    <div>
      <PageHeader
        title="Giriş Bilgileri"
        description="Admin paneline girişte kullanılan, ekip içinde paylaşılan ortak kullanıcı adı ve şifre."
      />

      <Card className="max-w-md">
        <form action={updateAdminCredentials} className="space-y-4">
          <div>
            <label className={labelClass}>Kullanıcı Adı</label>
            <input
              name="username"
              required
              defaultValue={credentials?.username ?? ""}
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label className={labelClass}>Şifre</label>
            <input
              name="password"
              required
              defaultValue={credentials?.password ?? ""}
              className={`${inputClass} w-full`}
            />
          </div>
          <p className="text-xs text-text-muted">
            Kaydettikten sonra tarayıcı yeni bilgileri isteyecek — açık oturumlar dahil, herkes yeni
            kullanıcı adı/şifre ile tekrar giriş yapmalı.
          </p>
          <SubmitButton className={buttonPrimaryClass}>Kaydet</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
