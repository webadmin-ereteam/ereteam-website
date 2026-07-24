import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Blocks the classic SSRF targets: loopback, RFC1918 private ranges,
// link-local (which is also where cloud metadata services like
// 169.254.169.254 live), CGNAT, and multicast/reserved space. Anything that
// isn't a recognizable public IPv4/IPv6 address is rejected by default
// (fail closed) rather than allowed through.
function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return true;
  const [a, b] = parts;
  if (a === 0) return true; // "this network"
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmarking
  if (a >= 224) return true; // multicast (224-239) + reserved (240-255)
  return false;
}

function isPrivateOrReservedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  if (/^fe[89ab][0-9a-f]:/.test(lower)) return true; // fe80::/10 link-local
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true; // fc00::/7 unique local
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped IPv6
  if (mapped) return isPrivateOrReservedIPv4(mapped[1]);
  return false;
}

function isPrivateOrReservedIP(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateOrReservedIPv4(ip);
  if (version === 6) return isPrivateOrReservedIPv6(ip);
  return true; // not a parseable IP at all — reject rather than guess
}

// Resolves every address a hostname maps to and rejects if *any* of them is
// private/reserved — a hostname that round-robins between a public and an
// internal address is still a way in otherwise.
async function assertPublicHostname(hostname: string): Promise<void> {
  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("Adres çözümlenemedi.");
  }
  if (addresses.length === 0 || addresses.some((a) => isPrivateOrReservedIP(a.address))) {
    throw new Error("Bu adrese erişilemiyor.");
  }
}

// fetch() that refuses to talk to loopback/private/link-local targets —
// checked both for the initial URL and for every redirect hop it follows
// (redirects are resolved manually, not left to fetch's own follow logic,
// specifically so a public URL that 302s to an internal one can't slip
// through). Does not defend against DNS rebinding — the resolved address is
// checked here but the actual TCP connection inside fetch() re-resolves the
// hostname itself, leaving a narrow window between check and connect. That's
// judged an acceptable residual risk for an admin-only, login-gated feature;
// it rules out the practical case (an admin literally typing an internal
// address or a URL that redirects to one), not a fully adversarial network.
export async function ssrfSafeFetch(
  initialUrl: URL,
  options: { signal: AbortSignal; maxRedirects?: number }
): Promise<Response> {
  const maxRedirects = options.maxRedirects ?? 5;
  let current = initialUrl;

  for (let hop = 0; ; hop++) {
    if (current.protocol !== "http:" && current.protocol !== "https:") {
      throw new Error("Sadece http(s) linkleri desteklenir.");
    }
    await assertPublicHostname(current.hostname);

    const res = await fetch(current.toString(), { signal: options.signal, redirect: "manual" });

    const isRedirect = res.status >= 300 && res.status < 400;
    if (!isRedirect) return res;

    if (hop >= maxRedirects) {
      throw new Error("Link çok fazla yönlendirme yapıyor.");
    }
    const location = res.headers.get("location");
    if (!location) return res;
    current = new URL(location, current);
  }
}
