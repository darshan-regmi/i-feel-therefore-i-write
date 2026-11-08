"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { PoemSnippet } from "./types";

const SCROLL_CSS = `
.qwzx-reader-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(233,226,208,0.18) transparent;
}
.qwzx-reader-scroll::-webkit-scrollbar { width: 6px; }
.qwzx-reader-scroll::-webkit-scrollbar-track { background: transparent; }
.qwzx-reader-scroll::-webkit-scrollbar-thumb {
  background: rgba(233,226,208,0.16);
  border-radius: 999px;
}
`;

/**
 * The full poem, lifted out of the drain. Stays open until X (or Escape).
 *
 * The article is a bottom sheet on phones and a centred card on larger
 * screens. The close control lives in a sticky bar pinned to the top of the
 * scroll area, so it is always one tap away no matter how long the poem is.
 * Once the reader scrolls, the bar fades from transparent to a frosted strip
 * and the title collapses into a single truncated line — the large title
 * stays in the flow and simply scrolls away, so nothing shifts around.
 */
export default function PoemReader({
  poem,
  onClose,
}: {
  poem: PoemSnippet | null;
  onClose: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (!poem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [poem, onClose]);

  // A new poem starts at the top with the bar still open.
  useEffect(() => {
    setScrolled(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [poem?.id]);

  const onScroll = useCallback(() => {
    // Coalesce to one read per frame; the state only flips at the threshold,
    // so React bails out on every frame in between.
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      setScrolled((scrollRef.current?.scrollTop ?? 0) > 8);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {poem && (
        <motion.div
          className="fixed inset-0 z-[75] flex items-end justify-center p-0 sm:items-center sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div aria-hidden className="absolute inset-0 bg-void/85" />

          <motion.article
            role="dialog"
            aria-modal="true"
            aria-label={poem.title}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-bone/15 bg-[#0f0b13] pb-[env(safe-area-inset-bottom)] shadow-[0_0_90px_rgba(59,29,90,0.55)] sm:max-h-[82vh] sm:rounded-2xl sm:pb-0"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <style>{SCROLL_CSS}</style>

            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="qwzx-reader-scroll relative flex-1 overflow-y-auto overscroll-contain"
            >
              {/* sticky top bar — always carries the close control */}
              <div
                className={`sticky top-0 z-20 flex h-14 items-center gap-3 px-5 transition-colors duration-200 sm:px-8 ${
                  scrolled
                    ? "border-b border-bone/10 bg-[#0f0b13]"
                    : "border-b border-transparent bg-transparent"
                }`}
              >
                <p
                  aria-hidden
                  className={`min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.24em] text-bone/45 transition-opacity duration-200 ${
                    scrolled ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {poem.title}
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close poem"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bone/15 text-bone/60 transition-colors hover:border-acid/40 hover:text-acid active:border-acid/50 active:text-acid"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="px-6 pb-12 sm:px-10 sm:pb-10">
                <h2
                  className="text-3xl italic leading-tight text-bone sm:text-4xl"
                  style={{ fontFamily: "var(--font-instrument-serif)" }}
                >
                  {poem.title}
                </h2>

                <div className="mt-6 h-px w-10 bg-acid/40" />

                <div className="mt-6 whitespace-pre-line font-serif text-[1.05rem] leading-[1.85] text-bone/85 sm:text-lg">
                  {poem.content}
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
