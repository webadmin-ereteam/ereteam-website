import AdminNav from "./AdminNav";
import AdminChatWidget from "./AdminChatWidget";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function PresalesAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-text-body">
      <AdminNav />
      <main className="flex-1 px-10 py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <AdminChatWidget />
    </div>
  );
}
