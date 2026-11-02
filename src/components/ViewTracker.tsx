"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  type: "project" | "post";
  slug: string;
}

export default function ViewTracker({ type, slug }: ViewTrackerProps) {
  useEffect(() => {
    if (!slug) return;

    // De-duplicate in same browser tab session to prevent artificial refresh spam
    const sessionKey = `tn_viewed_${type}_${slug}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, slug }),
    }).catch(() => {
      // Non-blocking fail-safe
    });
  }, [type, slug]);

  return null;
}
