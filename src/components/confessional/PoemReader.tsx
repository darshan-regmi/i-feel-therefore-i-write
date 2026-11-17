"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { PoemSnippet } from "./types";

const SCROLL_CSS = `
.qwzx-reader-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--faded) transparent;
}
.qwzx-reader-scroll::-webkit-scrollbar { width: 6px; }
.qwzx-reader-scroll::-webkit-scrollbar-track { background: transparent; }
.qwzx-reader-scroll::-webkit-scrollbar-thumb { background: var(--faded); }
`;

/**
 * The full poem, lifted out of the drain. Stays open until X (or Escape).
 *
 * The article is a bottom sheet on phones and a centred sheet on larger
 * screens. The close control lives in a sticky bar pinned to the top of the
 * scroll area, so it is always one tap away no matter how long the poem is.
 * Once the reader scrolls, the bar gains the paper background and the title
 * collapses into a single truncated line.
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

  useEffect(() => {
    setScrolled(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [poem?.id]);

  const onScroll = useCallback(() => {
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
          <div aria-hidden className="absolute inset-0 bg-paper/95" />

          <motion.article
            role="dialog"
            aria-modal="true"
            aria-label={poem.title}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden bg-paper pb-[env(safe-area-inset-bottom)] sm:max-h-[82vh] sm:pb-0"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <style>{SCROLL_CSS}</style>

            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="qwzx-reader-scroll relative flex-1 overflow-y-auto overscroll-contain"
            >
              <div
                className={`sticky top-0 z-20 flex h-14 items-center gap-3 px-5 transition-colors duration-200 sm:px-8 ${
                  scrolled ? "bg-paper" : "bg-transparent"
                }`}
              >
                <p
                  aria-hidden
                  className={`min-w-0 flex-1 truncate font-mono text-[10px] tracking-[0.24em] text-faded transition-opacity duration-200 ${
                    scrolled ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {poem.title}
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="close poem"
                  className="grid h-10 w-10 shrink-0 place-items-center text-faded transition-colors hover:text-ink"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="px-6 pb-12 sm:px-10 sm:pb-10">
                <h2
                  className="text-3xl italic leading-tight text-ink sm:text-4xl"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  {poem.title}
                </h2>

                <div className="mt-6 h-px w-10 bg-ink/40" />

                <div className="mt-6 whitespace-pre-line font-serif text-[1.05rem] leading-[1.85] text-ink sm:text-lg">
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
