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
    ],
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
        // invisible overlay. Only `frame-ancestors` is set here, not a full
        // CSP: a script-src policy would need auditing every third-party
        // script the marketing site loads elsewhere before it's safe to ship.
        source: "/presales/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
