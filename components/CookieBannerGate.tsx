"use client";

import { usePathname } from "next/navigation";

// CookieYes (app/layout.tsx) is a raw <Script>, not a React component, so it
// can't self-check the route the way Navbar/Footer/ChatWidget do — it renders
// its banner straight into the DOM regardless of path. On /presales pages
// (internal admin tool + no-login customer portal) it was overlapping the UI
// and swallowing clicks (confirmed live — it blocked the admin logout
// button). This just hides/disables it there; the script itself still loads
// unconditionally so marketing-site consent behavior is unaffected.
export default function CookieBannerGate() {
  const pathname = usePathname();
  if (!pathname.startsWith("/presales")) return null;

  return (
    <style>{`
      .cky-consent-container, .cky-modal, .cky-overlay, .cky-btn-revisit-wrapper, #cookieyes {
        display: none !important;
        pointer-events: none !important;
      }
    `}</style>
  );
}
