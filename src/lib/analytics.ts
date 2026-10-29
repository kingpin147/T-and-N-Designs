import posthog from "posthog-js";

export function getOrCreateDistinctId(): string {
  if (typeof window === "undefined") return "anon_server";
  try {
    let did = localStorage.getItem("tnn_distinct_id");
    if (!did) {
      did = "anon_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
      localStorage.setItem("tnn_distinct_id", did);
    }
    return did;
  } catch {
    return "anon_fallback";
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "sess_server";
  try {
    let sid = sessionStorage.getItem("tnn_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
      sessionStorage.setItem("tnn_session_id", sid);
    }
    return sid;
  } catch {
    return "sess_fallback";
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;

  const distinctId = getOrCreateDistinctId();
  const sessionId = getOrCreateSessionId();
  const pathname = window.location.pathname + window.location.search + window.location.hash;
  const referrer = document.referrer || "";

  // 1. First-party database persistence & PostHog server forwarding
  try {
    const payload = JSON.stringify({
      event: eventName,
      pathname,
      referrer,
      session_id: sessionId,
      distinct_id: distinctId,
      properties: properties || {},
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    console.debug("[Analytics Track Error]", err);
  }

  // 2. PostHog Client JS
  try {
    posthog.capture(eventName, {
      ...properties,
      $current_url: pathname,
      distinct_id: distinctId,
    });
  } catch (err) {
    console.debug("[PostHog Track Error]", err);
  }

  // 3. Google Analytics & Google Ads Event
  try {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, properties);

      if (eventName === "lead_submitted") {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-10987292991",
          ...properties,
        });
      }
    }
  } catch (err) {
    console.debug("[Google Analytics Track Error]", err);
  }
}
