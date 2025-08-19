"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) return;
    const href = window.location.href;
    const pathWithQuery = window.location.pathname + window.location.search;

    window.gtag("event", "page_view", {
      page_location: href,
      page_path: pathWithQuery,
    });
  }, [pathname, searchParams]);

  return null;
}
