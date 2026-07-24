import { getAdminUsername } from "@/lib/presales/auth";
import { updateAdminCredentials, revokeAllSessions } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
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
            Kaydettikten sonra herkesin yeni şifreyle tekrar giriş yapması gerekir — halihazırda
            açık olan tüm oturumlar (kendi tarayıcın dahil) bu kayıtla birlikte otomatik kapanır.
          </p>
          <SubmitButton className={buttonPrimaryClass}>Kaydet</SubmitButton>
        </form>
      </Card>

      <Card className="mt-6 max-w-md">
        <p className="mb-2 text-sm font-medium text-brand-dark">Tüm Oturumları Kapat</p>
        <p className="mb-3 text-xs text-text-muted">
          Şifreyi değiştirmeden, sadece açık olan tüm oturumları (kendi tarayıcın dahil, ekipteki
          herkes) kapatır — kayıp/çalıntı bir cihaz ya da paylaşılan bir bilgisayardan sonra
          kullanışlı. Herkesin tekrar giriş yapması gerekir.
        </p>
        <form action={revokeAllSessions}>
          <SubmitButton
            className={buttonSecondaryClass}
            pendingLabel="Kapatılıyor..."
            confirmMessage="Bu, kendi tarayıcın dahil ekipteki herkesin oturumunu kapatacak — herkesin tekrar giriş yapması gerekecek. Devam edilsin mi?"
          >
            Tüm Cihazlardan Çıkış Yap
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
