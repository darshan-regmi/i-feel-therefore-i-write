"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

/**
 * Ticks 0 → value without re-rendering React each frame. The previous version
 * stored the number in state, which re-rendered the whole scene (blob, six
 * eyes, falling poems) ~60 times a second during the swallow.
 */
export default function Counter({
  value,
  duration,
}: {
  value: number;
  duration: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.textContent = "0";

    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = String(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}
