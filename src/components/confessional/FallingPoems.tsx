"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { PoemSnippet } from "./types";

const HOVER_DWELL_MS = 1000;

const FALL_CSS = `
@keyframes qwzx-fall {
  0% {
    transform: translate3d(calc(var(--fx) - 50%), -46vh, 0) rotate(var(--fr)) scale(1);
    opacity: 0;
  }
  12% { opacity: 0.85; }
  100% {
    transform: translate3d(-50%, 3vh, 0) rotate(0deg) scale(0.16);
    opacity: 0;
  }
}
.qwzx-fall {
  animation-name: qwzx-fall;
  animation-duration: var(--fd);
  animation-delay: var(--fdl);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform, opacity;
}
.qwzx-fall:hover {
  animation-play-state: paused;
}
.qwzx-falling[data-paused="true"] .qwzx-fall {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .qwzx-falling { display: none; }
}
`;

function seeded(index: number, salt: number, seed: number): number {
  const value = Math.sin((index + 1) * salt + seed) * 10000;
  return value - Math.floor(value);
}

/**
 * The block shows the poem's title — what it is, not a piece of it. Only if a
 * poem somehow has no title do we fall back to its opening line.
 */
function label(poem: PoemSnippet): string {
  const title = poem.title.trim();

  const text =
    title.length > 0
      ? title
      : (poem.content
          .split("\n")
          .map((line) => line.trim())
          .find((line) => line.length > 0) ?? "");

  return text.length > 64 ? `${text.slice(0, 64)}…` : text;
}

export default function FallingPoems({
  poems,
  active,
  paused,
  seed,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: {
  poems: PoemSnippet[];
  active: boolean;
  paused: boolean;
  seed: number;
  onOpen: (poem: PoemSnippet) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const timers = useRef<Map<string, number>>(new Map());

  const lines = useMemo(() => {
    if (poems.length === 0) return [];

    return Array.from({ length: 34 }, (_, index) => {
      const poem = poems[index % poems.length];
      const duration = 1.9 + seeded(index, 93.989, seed) * 1.6;
      return {
        key: `${seed}-${index}-${poem.id}`,
        poem,
        text: label(poem),
        left: 10 + seeded(index, 12.9898, seed) * 80,
        drift: (seeded(index, 78.233, seed) - 0.5) * 34,
        rotate: (seeded(index, 12.9898, seed) - 0.5) * 18,
        duration,
        delay: seeded(index, 43.758, seed) * duration,
        size: 0.82 + seeded(index, 23.14, seed) * 0.7,
      };
    });
  }, [poems, seed]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, [lines]);

  if (!active || lines.length === 0) return null;

  const cancel = (key: string) => {
    const timer = timers.current.get(key);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(key);
    }
  };

  const enter = (key: string, poem: PoemSnippet) => {
    onHoverStart();
    cancel(key);
    const timer = window.setTimeout(() => {
      timers.current.delete(key);
      onOpen(poem);
    }, HOVER_DWELL_MS);
    timers.current.set(key, timer);
  };

  const leave = (key: string) => {
    cancel(key);
    onHoverEnd();
  };

  return (
    <div
      aria-hidden
      data-paused={paused ? "true" : "false"}
      className="qwzx-falling pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      <style>{FALL_CSS}</style>

      {lines.map((line) => (
        <div
          key={line.key}
          className="qwzx-fall pointer-events-auto absolute top-1/2 cursor-none"
          style={
            {
              left: `${line.left}%`,
              fontSize: `${line.size}rem`,
              "--fx": `${line.drift}vw`,
              "--fr": `${line.rotate}deg`,
              "--fd": `${line.duration}s`,
              "--fdl": `-${line.delay}s`,
            } as CSSProperties
          }
          onPointerEnter={() => enter(line.key, line.poem)}
          onPointerLeave={() => leave(line.key)}
          onPointerDown={(event) => {
            // Touch has no hover; a tap opens the poem.
            if (event.pointerType !== "mouse") {
              event.stopPropagation();
              cancel(line.key);
              onOpen(line.poem);
            }
          }}
        >
          <span className="block whitespace-nowrap px-2 py-1 font-mono text-bone/80">
            {line.text}
          </span>
        </div>
      ))}
    </div>
  );
}
