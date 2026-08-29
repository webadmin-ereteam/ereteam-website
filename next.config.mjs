/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stops leaking "Next.js" (and its version, via other means) in responses —
  // trivial info disclosure, no reason to keep it.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/thumbnail",
      },
      {
        protocol: "https",
        hostname: "media.licdn-ei.com",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/blog/:path*", destination: "/social-media", permanent: true },
      { source: "/news/:path*", destination: "/social-media", permanent: true },
      { source: "/about/certifications", destination: "/about/company", permanent: true },
      { source: "/industry-expertise/:path*", destination: "/use-cases", permanent: true },
      { source: "/success-stories/:path*", destination: "/use-cases", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Site-wide, and safe everywhere: neither restricts scripts, styles,
        // or fonts, so nothing here risks breaking the marketing site's
        // third-party embeds (HubSpot, CookieYes, etc).
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Clickjacking protection, scoped to the presales tool specifically —
        // both the admin login and the no-login customer survey link take
        // sensitive input (a password, or real business answers) that an
        // attacker could try to capture by iframing the page with an
        // invisible overlay.
        source: "/presales/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Report-only, not enforcing: `/presales/*` inherits the root
          // layout's CookieYes + HubSpot embeds, and those load additional
          // sub-resources from hosts not fully enumerated here — flipping
          // this to enforcing without first confirming nothing else gets
          // blocked risks silently breaking cookie consent or the chat
          // widget in production. `'unsafe-inline'` is required because
          // Next's App Router streams hydration data via inline
          // `<script>self.__next_f.push(...)</script>` tags with no
          // nonce wired up — so this doesn't block inline-script XSS
          // payloads, only script tags pointing at a host outside this
          // list, which is still real coverage against the most common
          // injection shape (`<script src="https://attacker...">`).
          // Check the browser console for `report-only` CSP violations
          // for a few days before ever making this the enforcing header.
          {
            key: "Content-Security-Policy-Report-Only",
            value: "script-src 'self' 'unsafe-inline' https://cdn-cookieyes.com https://js-eu1.hs-scripts.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
