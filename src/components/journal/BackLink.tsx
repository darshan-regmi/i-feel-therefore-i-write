"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

/**
 * Goes back when the visitor arrived from this site (same-origin referrer and
 * real history), otherwise follows the parent link.
 */
export default function BackLink({ parent }: { parent: string }) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    let fromThisSite = false;
    try {
      if (document.referrer) {
        fromThisSite = new URL(document.referrer).origin === window.location.origin;
      }
    } catch {
      fromThisSite = false;
    }

    if (fromThisSite && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <a href={parent} onClick={handleClick} className="back-link plain-link">
      ← back
    </a>
  );
}
