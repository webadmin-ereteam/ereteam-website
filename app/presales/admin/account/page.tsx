import { getAdminUsername } from "@/lib/presales/auth";
import { updateAdminCredentials } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

export default async function AdminAccountPage() {
  const username = await getAdminUsername();

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
            <input name="username" required defaultValue={username ?? ""} className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Yeni Şifre</label>
            <input
              name="password"
              type="password"
              placeholder="Değiştirmek istemiyorsan boş bırak"
              className={`${inputClass} w-full`}
            />
            <p className="mt-1 text-xs text-text-muted">
              Şifre güvenlik nedeniyle burada gösterilmez — mevcut şifreyi kontrol edemezsin, sadece
              yenisini belirleyebilirsin.
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Kaydettikten sonra yeni şifreyle tekrar giriş yapman gerekir — ama halihazırda açık
            oturumlar (kendi tarayıcın dahil) otomatik olarak kapanmaz, 7 gün sonra kendi kendine
            sona erer.
          </p>
          <SubmitButton className={buttonPrimaryClass}>Kaydet</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
