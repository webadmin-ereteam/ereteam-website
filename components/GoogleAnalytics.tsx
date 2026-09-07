"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-0V31HZ3HP5";

type CookieYesConsent = {
  categories?: {
    analytics?: boolean;
  };
};

type CookieYesBannerEvent = CustomEvent<CookieYesConsent>;
type CookieYesUpdateEvent = CustomEvent<{ accepted?: string[] }>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    getCkyConsent?: () => CookieYesConsent;
    __ereteamGaInitialized?: boolean;
    __cookieYesAnalyticsAllowed?: boolean;
  }
}

function setAnalyticsConsent(granted: boolean) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function initializeAnalytics() {
  if (window.__ereteamGaInitialized) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.dataset.ereteamAnalytics = "true";
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });
  window.__ereteamGaInitialized = true;
}

function initializeHubSpot() {
  if (document.getElementById("hs-script-loader")) return;

  const script = document.createElement("script");
  script.id = "hs-script-loader";
  script.async = true;
  script.defer = true;
  script.src = "https://js-eu1.hs-scripts.com/147286586.js";
  document.body.appendChild(script);
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const isInternalArea =
    pathname.startsWith("/presales") || pathname.startsWith("/spark");

  useEffect(() => {
    if (isInternalArea) {
      setAnalyticsConsent(false);
      setAnalyticsAllowed(false);
      return;
    }

    const applyConsent = (allowed: boolean) => {
      setAnalyticsConsent(allowed);
      setAnalyticsAllowed(allowed);
      if (allowed) {
        initializeAnalytics();
        initializeHubSpot();
      }
    };

    const syncFromCookieYes = () => {
      if (typeof window.__cookieYesAnalyticsAllowed === "boolean") {
        applyConsent(window.__cookieYesAnalyticsAllowed);
        return;
      }

      const consent = window.getCkyConsent?.();
      if (consent) applyConsent(Boolean(consent.categories?.analytics));
    };

    const handleBannerLoad = (event: Event) => {
      const detail = (event as CookieYesBannerEvent).detail;
      applyConsent(Boolean(detail?.categories?.analytics));
    };

    const handleConsentUpdate = (event: Event) => {
      const accepted = (event as CookieYesUpdateEvent).detail?.accepted || [];
      applyConsent(accepted.includes("analytics"));
    };

    document.addEventListener("cookieyes_banner_load", handleBannerLoad);
    document.addEventListener("cookieyes_banner_loaded", handleBannerLoad);
    document.addEventListener("cookieyes_consent_update", handleConsentUpdate);

    syncFromCookieYes();
    const retryTimer = window.setInterval(syncFromCookieYes, 500);
    const stopRetryTimer = window.setTimeout(
      () => window.clearInterval(retryTimer),
      10_000,
    );

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetryTimer);
      document.removeEventListener("cookieyes_banner_load", handleBannerLoad);
      document.removeEventListener("cookieyes_banner_loaded", handleBannerLoad);
      document.removeEventListener("cookieyes_consent_update", handleConsentUpdate);
    };
  }, [isInternalArea]);

  useEffect(() => {
    if (!analyticsAllowed || isInternalArea) return;

    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [analyticsAllowed, isInternalArea, pathname]);

  return null;
}
