"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import Eye from "./Eye";
import type { ConfessionalPhase } from "./types";

const ZZZ_CSS = `
@keyframes qwzx-zzz {
  0% {
    opacity: 0;
    transform: translate3d(0, 8px, 0) scale(0.55) rotate(-10deg);
  }
  16% { opacity: 0.9; }
  70% { opacity: 0.45; }
  100% {
    opacity: 0;
    transform: translate3d(26px, -80px, 0) scale(1.2) rotate(12deg);
  }
}
.qwzx-zzz {
  animation: qwzx-zzz 3.6s ease-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .qwzx-zzz { animation-duration: 6s; }
}
`;

/**
 * A slow breathing ink blob: bruise core fading to void, an acid rim tracing
 * the edge, and six eyes floating inside it.
 *
 * It sleeps. After a few seconds without input the eyes droop shut, the body
 * slumps and breathes deeper, and z's drift off it. Clicking it wakes it; while
 * it sleeps the page refuses the keyboard.
 *
 * Performance notes (this room is animated 24/7):
 *  - The SVG filter is static. feTurbulence + feDisplacementMap are expensive
 *    to rasterise, so we rasterise once and move the result as a composited
 *    layer. Animating baseFrequency per frame re-ran the whole filter on every
 *    frame, which was the single largest cost on this page.
 *  - The "alive" wobble now comes from anisotropic scale on the wrapper, which
 *    the compositor handles for free. All the visible motion (breathing, drift,
 *    lean, tilt) is preserved.
 *  - The rim lives inside the same filtered group so it costs one rasterise,
 *    not three.
 */
export default function Blob({
  mx,
  my,
  asleep,
  phase,
  openCount,
  onWake,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  asleep: boolean;
  phase: ConfessionalPhase;
  openCount: number;
  onWake: () => void;
}) {
  const reduce = useReducedMotion();

  const leanX = useTransform(mx, [-1, 1], [-16, 16]);
  const leanY = useTransform(my, [-1, 1], [-12, 12]);
  const tilt = useTransform(mx, [-1, 1], [-5, 5]);

  const swallowing = phase === "swallowing" || phase === "drained";
  const recoiling = phase === "wrong";

  return (
    <motion.div
      className="relative h-[clamp(300px,58vh,560px)] w-[clamp(300px,58vh,560px)] focus:outline-none"
      style={{
        x: leanX,
        y: leanY,
        rotate: tilt,
        willChange: "transform",
      }}
      onPointerDown={asleep ? onWake : undefined}
      role={asleep ? "button" : undefined}
      tabIndex={asleep ? 0 : undefined}
      aria-label={asleep ? "wake the blob to type" : undefined}
      onKeyDown={
        asleep
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onWake();
              }
            }
          : undefined
      }
    >
      {asleep && (
        <>
          <style>{ZZZ_CSS}</style>
          <div
            aria-hidden
            className="pointer-events-none absolute right-[16%] top-[16%] z-20"
          >
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="qwzx-zzz absolute left-0 top-0 italic text-acid/70"
                style={{
                  fontFamily: "var(--font-instrument-serif)",
                  fontSize: `${0.85 + index * 0.32}rem`,
                  animationDelay: `${index * 1.2}s`,
                }}
              >
                z
              </span>
            ))}
          </div>

          <motion.p
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            className="pointer-events-none absolute inset-x-0 -bottom-6 text-center font-mono text-[9px] tracking-[0.3em] text-bone/30"
          >
            <span className="sm:hidden">tap to wake</span>
            <span className="hidden sm:inline">click to wake</span>
          </motion.p>
        </>
      )}

      <motion.div
        className="h-full w-full"
        style={{ willChange: "transform" }}
        animate={
          swallowing
            ? { scale: 1.8, opacity: 0.35, x: 0, y: 0, rotate: 0 }
            : recoiling
              ? { scale: 0.82, x: 130, y: 150, rotate: -10, opacity: 1 }
              : asleep
                ? { scale: 0.96, x: 0, y: 16, rotate: 8, opacity: 1 }
                : { scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 }
        }
        transition={{
          type: "spring",
          stiffness: recoiling ? 420 : asleep ? 16 : 80,
          damping: recoiling ? 18 : asleep ? 24 : 20,
          mass: 0.9,
        }}
      >
        <motion.div
          className="h-full w-full"
          style={{ willChange: "transform" }}
          animate={
            reduce
              ? undefined
              : {
                  scaleX: [1, 1.018, 0.995, 1],
                  scaleY: [1, 0.985, 1.03, 1],
                  rotate: [-1.4, 1.2, -0.8, -1.4],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: asleep ? 19 : 13,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <svg
            viewBox="0 0 400 400"
            className="h-full w-full"
            aria-hidden
            style={{ willChange: "transform" }}
          >
            <defs>
              <radialGradient id="confessional-blob-fill" cx="48%" cy="40%" r="64%">
                <stop offset="0%" stopColor="#6a3a96" />
                <stop offset="36%" stopColor="#3b1d5a" />
                <stop offset="76%" stopColor="#1a0f2a" />
                <stop offset="100%" stopColor="#0b0a0a" />
              </radialGradient>

              <filter
                id="confessional-blob-warp"
                x="-18%"
                y="-18%"
                width="136%"
                height="136%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.011 0.017"
                  numOctaves="2"
                  seed="11"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="22"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
                <feGaussianBlur stdDeviation="1.1" />
              </filter>
            </defs>

            {/* One filtered group: fill + rim are rasterised together. */}
            <g filter="url(#confessional-blob-warp)">
              <ellipse
                cx="200"
                cy="200"
                rx="150"
                ry="163"
                fill="url(#confessional-blob-fill)"
              />
              {/* soft halo, painted as a wide stroke instead of a second filter */}
              <ellipse
                cx="200"
                cy="200"
                rx="150"
                ry="163"
                fill="none"
                stroke="#c6ff3d"
                strokeWidth="7"
                strokeOpacity="0.06"
              />
              <ellipse
                cx="200"
                cy="200"
                rx="150"
                ry="163"
                fill="none"
                stroke="#c6ff3d"
                strokeWidth="1.1"
                strokeOpacity="0.55"
              />
            </g>
          </svg>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex items-center gap-2.5 sm:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Eye
              key={index}
              index={index}
              open={index < openCount}
              phase={phase}
              mx={mx}
              my={my}
              asleep={asleep}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
