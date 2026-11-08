"use client";

import { useEffect, useState } from "react";

/**
 * `qwzx / 03:14 / nobody is here.`
 *
 * The clock is live and deliberately a little wrong: the separator flickers
 * between a colon and a raised colon once a second.
 */
export default function TimeStamp() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hours = now ? String(now.getHours()).padStart(2, "0") : "--";
  const minutes = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const separator = now && now.getSeconds() % 2 === 0 ? ":" : "⁚";

  return (
    <p className="pointer-events-none fixed left-4 top-4 z-50 font-mono text-[10px] tracking-[0.2em] text-bone/40 sm:left-5 sm:top-5 sm:text-[11px] sm:tracking-[0.22em]">
      qwzx / {hours}
      {separator}
      {minutes} / nobody is here.
    </p>
  );
}
