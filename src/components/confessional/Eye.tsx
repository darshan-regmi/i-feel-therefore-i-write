"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import type { ConfessionalPhase } from "./types";

const PUPIL = 7;

export default function Eye({
  index,
  open,
  phase,
  mx,
  my,
  asleep,
}: {
  index: number;
  open: boolean;
  phase: ConfessionalPhase;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  asleep: boolean;
}) {
  const reduce = useReducedMotion();

  const trackX = useTransform(mx, [-1, 1], [-4.5, 4.5]);
  const trackY = useTransform(my, [-1, 1], [-3, 3.5]);

  const acid = phase === "swallowing" || phase === "drained";
  const shut = phase === "wrong";
  const closing = phase === "done";

  const isOpen = acid ? true : shut ? false : closing ? false : asleep ? false : open;

  return (
    <div className="relative flex h-7 w-9 items-center justify-center sm:h-8 sm:w-12">
      {/* eyelid: the whole eye squashes to a slit when closed */}
      <motion.div
        className="absolute inset-0 rounded-[50%] border"
        style={{
          borderColor: acid ? "#c6ff3d" : "rgba(233,226,208,0.42)",
          backgroundColor: acid ? "#c6ff3d" : "rgba(11,10,10,0.55)",
          boxShadow: acid
            ? "0 0 20px rgba(198,255,61,0.5)"
            : "inset 0 0 10px rgba(0,0,0,0.55)",
        }}
        animate={{ scaleY: isOpen ? 1 : 0.035 }}
        transition={{
          type: "spring",
          stiffness: shut ? 900 : asleep ? 140 : 300,
          damping: shut ? 30 : asleep ? 26 : 22,
          delay: closing ? index * 0.12 : asleep ? index * 0.07 : 0,
        }}
      >
        {acid ? (
          <span
            className="absolute left-1/2 top-1/2 rounded-full bg-void"
            style={{ width: PUPIL, height: PUPIL, marginLeft: -PUPIL / 2, marginTop: -PUPIL / 2 }}
          />
        ) : (
          <motion.span
            className="absolute left-1/2 top-1/2 rounded-full bg-acid"
            style={{
              width: PUPIL,
              height: PUPIL,
              marginLeft: -PUPIL / 2,
              marginTop: -PUPIL / 2,
              x: asleep ? 0 : trackX,
              y: asleep ? 5 : trackY,
            }}
            animate={{ opacity: isOpen ? 1 : 0 }}
          />
        )}
      </motion.div>

      {/* the flat line that reads as a closed eye */}
      <motion.span
        aria-hidden
        className="absolute left-0 right-0 top-1/2 h-px bg-bone/45"
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{
          duration: reduce ? 0 : 0.15,
          delay: closing ? index * 0.12 + 0.08 : asleep ? index * 0.07 + 0.05 : 0,
        }}
      />
    </div>
  );
}
