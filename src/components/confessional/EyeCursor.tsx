"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

const BLINK_CLOSED = 0.06;

/**
 * Replaces the arrow with a small open eye. The pupil leans toward the
 * direction of travel, and the lid blinks at an uneven, human pace (every
 * 2.5–5.5s, with the occasional double blink). Hidden on touch/coarse pointers.
 */
export default function EyeCursor() {
  const [enabled, setEnabled] = useState(false);
  const reduce = useReducedMotion();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const pupilTarget = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 900, damping: 55, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 900, damping: 55, mass: 0.35 });
  const pupilX = useSpring(pupilTarget, { stiffness: 160, damping: 18, mass: 0.5 });

  const lid = useAnimationControls();
  const last = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    setEnabled(fine.matches);

    const onChange = () => setEnabled(fine.matches);
    fine.addEventListener?.("change", onChange);
    return () => fine.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);

      const dx = event.clientX - last.current.x;
      const dy = event.clientY - last.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        pupilTarget.set(Math.max(-4.5, Math.min(4.5, dx / 3)));
        last.current = { x: event.clientX, y: event.clientY };
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, pupilTarget, x, y]);

  useEffect(() => {
    if (!enabled) return;

    // Someone who is reading does not blink on a metronome. Uneven intervals,
    // mostly ~3–5s apart, and now and then a quick second one.
    let stopped = false;
    let timer = 0;

    const blink = () =>
      lid.start({
        scaleY: [1, BLINK_CLOSED, 1],
        transition: { duration: reduce ? 0.1 : 0.17, times: [0, 0.45, 1], ease: "easeInOut" },
      });

    const schedule = () => {
      const wait = 2500 + Math.random() * 3000;
      timer = window.setTimeout(async () => {
        if (stopped) return;
        await blink();
        if (stopped) return;

        if (Math.random() < 0.22) {
          await new Promise<void>((resolve) => {
            timer = window.setTimeout(resolve, 140);
          });
          if (stopped) return;
          await blink();
        }

        if (!stopped) schedule();
      }, wait);
    };

    schedule();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [enabled, lid, reduce]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: springX, y: springY }}
    >
      <svg
        width="30"
        height="20"
        viewBox="0 0 30 20"
        className="-translate-x-1/2 -translate-y-1/2"
      >
        <motion.g
          animate={lid}
          style={{ transformOrigin: "15px 10px", transformBox: "view-box" }}
        >
          <ellipse
            cx="15"
            cy="10"
            rx="13"
            ry="8"
            fill="rgba(11,10,10,0.35)"
            stroke="rgba(233,226,208,0.7)"
            strokeWidth="1"
          />
          <motion.circle
            cx="15"
            cy="10"
            r="2.6"
            fill="#c6ff3d"
            style={{ x: pupilX }}
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}
