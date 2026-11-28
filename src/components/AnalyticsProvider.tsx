"use client";

import React, { useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { trackEvent, getOrCreateDistinctId, getOrCreateSessionId } from "@/lib/analytics";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-N4VF65ME9Q";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-10987292991";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GT-T5MDR2V6";
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || "GT-MBND7LX9";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog
    if (POSTHOG_KEY && typeof window !== "undefined") {
      try {
        posthog.init(POSTHOG_KEY, {
          api_host: "/ingest",
          ui_host: "https://us.posthog.com",
          capture_pageview: false, // We manually trigger on route change
          capture_pageleave: true,
          autocapture: true,
        });
      } catch (err) {
        console.debug("[PostHog Init Notice]", err);
      }
    }
  }, []);

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    const isExtensionRoute = pathname.startsWith("/extension") || pathname.startsWith("/localsop");
    const extensionName = pathname.includes("localsop") ? "LocalSOP" : "Auto Fill Form";

    // Track real pageview across DB and analytics tools
    trackEvent("$pageview", {
      $current_url: url,
      title: typeof document !== "undefined" ? document.title : "",
      ...(isExtensionRoute
        ? {
            is_extension: true,
            extension_name: extensionName,
            traffic_channel: "chrome_extension",
          }
        : {}),
    });

    // Track in Google Analytics 4
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("config", GA_MEASUREMENT_ID, {
        page_path: url,
        ...(isExtensionRoute
          ? {
              campaign_source: "chrome_extension",
              campaign_medium: "extension",
              campaign_name: extensionName,
            }
          : {}),
      });
      (window as any).gtag("config", GOOGLE_ADS_ID, {
        page_path: url,
      });

      if (isExtensionRoute) {
        (window as any).gtag("event", "extension_visit", {
          extension_name: extensionName,
          page_path: pathname,
        });
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Google tag (gtag.js) for GA4, Google Ads, and GTM */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-tag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // 1. Google Analytics 4 (Primary Measurement)
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });

            // 2. Google Ads (Conversions & Remarketing)
            gtag('config', '${GOOGLE_ADS_ID}');

            // 3. Google Tag Manager Containers
            gtag('config', '${GTM_ID}');
            gtag('config', '${GTM_CONTAINER_ID}');
          `,
        }}
      />

      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>

      {children}
    </>
  );
}
