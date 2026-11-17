"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import Blob from "@/components/confessional/Blob";
import Counter from "@/components/confessional/Counter";
import EyeCursor from "@/components/confessional/EyeCursor";
import FallingPoems from "@/components/confessional/FallingPoems";
import Grain from "@/components/confessional/Grain";
import PoemReader from "@/components/confessional/PoemReader";
import TimeStamp from "@/components/confessional/TimeStamp";
import useSnoring from "@/components/confessional/useSnoring";
import {
  PIN_LENGTH,
  type ConfessionalPhase,
  type PoemSnippet,
} from "@/components/confessional/types";

const GLITCH_CSS = `
@keyframes qwzx-glitch-a {
  0%, 100% { transform: translate(-2px, 0); }
  50% { transform: translate(2px, -1px); }
}
@keyframes qwzx-glitch-b {
  0%, 100% { transform: translate(2px, 0); }
  50% { transform: translate(-2px, 1px); }
}
.qwzx-glitch { position: relative; display: inline-block; }
.qwzx-glitch::before,
.qwzx-glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.qwzx-glitch::before {
  color: #9a3b2b;
  animation: qwzx-glitch-a 0.18s steps(2) infinite;
}
.qwzx-glitch::after {
  color: #2a2520;
  animation: qwzx-glitch-b 0.16s steps(2) infinite;
}
`;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const LOCKED_PHASES: ConfessionalPhase[] = ["swallowing", "drained", "done", "wrong"];

/** With no input for this long the blob goes to sleep and stops taking keys. */
const SLEEP_AFTER_MS = 5000;

export default function ConfessionalPage() {
  const [phase, setPhase] = useState<ConfessionalPhase>("idle");
  const [digits, setDigits] = useState("");
  const [poems, setPoems] = useState<PoemSnippet[]>([]);
  const [target, setTarget] = useState(0);
  const [reader, setReader] = useState<PoemSnippet | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [seed, setSeed] = useState(0);
  const [asleep, setAsleep] = useState(false);
  const [coarse, setCoarse] = useState(false);

  const reduce = useReducedMotion();
  const shake = useAnimationControls();

  // Normalised cursor position (-1..1) with a soft spring; used by the blob
  // lean and the pupils.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 55, damping: 18, mass: 0.7 });
  const my = useSpring(rawY, { stiffness: 55, damping: 18, mass: 0.7 });

  const phaseRef = useRef(phase);
  const asleepRef = useRef(asleep);
  const readerRef = useRef(false);
  const holdRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const cancelled = useRef(false);
  const sleepTimer = useRef<number | null>(null);
  const lastBump = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
    asleepRef.current = asleep;
  }, [phase, asleep]);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    setCoarse(query.matches);
    const onChange = () => setCoarse(query.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  const bumpActivity = useCallback(() => {
    setAsleep(false);
    if (sleepTimer.current) window.clearTimeout(sleepTimer.current);

    // Re-arm until the room actually settles: a running sync must not put the
    // blob to sleep mid-swallow, and neither must a poem being read.
    const arm = () => {
      sleepTimer.current = window.setTimeout(() => {
        if (LOCKED_PHASES.includes(phaseRef.current) || readerRef.current) {
          arm();
          return;
        }

        setAsleep(true);
        rawX.set(0);
        rawY.set(0);
      }, SLEEP_AFTER_MS);
    };

    arm();
  }, [rawX, rawY]);

  useEffect(() => {
    bumpActivity();
    return () => {
      if (sleepTimer.current) window.clearTimeout(sleepTimer.current);
    };
  }, [bumpActivity]);

  const stir = useSnoring(asleep);

  // Waking is a deliberate act: the blob is clicked, the eyes open, and on
  // touch the numeric keyboard comes up with it. The click also makes a small
  // groggy hum, which is how you know the room has sound at all.
  const wake = useCallback(() => {
    stir();
    bumpActivity();
    if (coarse) inputRef.current?.focus({ preventScroll: true });
  }, [bumpActivity, coarse, stir]);

  useEffect(() => {
    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const onMove = (event: PointerEvent) => {
      // Moving the pointer does not wake a sleeping blob; only a click does.
      if (coarse || asleepRef.current) return;
      nextX = (event.clientX / window.innerWidth) * 2 - 1;
      nextY = (event.clientY / window.innerHeight) * 2 - 1;

      // Coalesce pointer events to one spring write per frame. Trackpads can
      // fire well above 60Hz.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        rawX.set(nextX);
        rawY.set(nextY);

        const now = Date.now();
        if (now - lastBump.current > 600) {
          lastBump.current = now;
          bumpActivity();
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [bumpActivity, coarse, rawX, rawY]);

  const openPoem = useCallback((poem: PoemSnippet) => {
    readerRef.current = true;
    holdRef.current = true;
    setReader(poem);
  }, []);

  const closePoem = useCallback(() => {
    readerRef.current = false;
    holdRef.current = false;
    setReader(null);
    bumpActivity();
  }, [bumpActivity]);

  const holdReading = useCallback(() => {
    holdRef.current = true;
  }, []);

  const releaseReading = useCallback(() => {
    // Keep holding while the reader is open; the pointer leaving a falling
    // block must not let the timeline advance behind the poem.
    if (!readerRef.current) holdRef.current = false;
  }, []);

  const failWrong = useCallback(async () => {
    setPhase("wrong");
    setDigits("");
    setFlash(true);
    window.setTimeout(() => setFlash(false), 150);
    void shake.start({
      x: [0, -12, 12, -8, 8, -4, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });

    await sleep(1150);
    if (cancelled.current) return;
    setPhase("idle");
  }, [shake]);

  const submit = useCallback(
    async (code: string) => {
      if (inFlight.current) return;
      inFlight.current = true;
      cancelled.current = false;

      setPhase("swallowing");
      setNotice(null);
      setTarget(0);
      setPoems([]);
      setSeed((value) => value + 1);

      // Hold the drain open while a poem is hovered or being read, so the
      // 1s dwell is actually achievable.
      const waitHeld = async (ms: number) => {
        let remaining = ms;
        while (remaining > 0) {
          if (cancelled.current) return;
          if (!holdRef.current) remaining -= 100;
          await sleep(100);
        }
      };

      const startedAt = Date.now();

      try {
        const [syncResponse, poemsResponse] = await Promise.all([
          fetch("/api/sync", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code }),
            cache: "no-store",
          }),
          fetch("/api/poem", { cache: "no-store" }).catch(() => null),
        ]);

        if (cancelled.current) return;

        if (syncResponse.status === 401) {
          await failWrong();
          return;
        }

        if (!syncResponse.ok) {
          setNotice("the void is busy.");
          setPhase("idle");
          setDigits("");
          await sleep(2200);
          if (!cancelled.current) setNotice(null);
          return;
        }

        const payload = (await syncResponse.json()) as {
          stats?: { notionTotal?: number; firestoreTotal?: number };
        };

        if (poemsResponse?.ok) {
          try {
            const poemPayload = (await poemsResponse.json()) as {
              poems?: Array<{
                id?: string;
                title?: string;
                content?: string;
              }>;
            };

            const nextPoems: PoemSnippet[] = (poemPayload.poems ?? [])
              .flatMap((poem, index) => {
                if (
                  !poem ||
                  typeof poem.title !== "string" ||
                  typeof poem.content !== "string" ||
                  poem.content.length === 0
                ) {
                  return [];
                }
                return [
                  {
                    id:
                      typeof poem.id === "string"
                        ? poem.id
                        : `${index}-${poem.title}`,
                    title: poem.title,
                    content: poem.content,
                  },
                ];
              })
              .slice(0, 80);

            if (!cancelled.current) setPoems(nextPoems);
          } catch {
            // Poems are decoration; the sync already succeeded.
          }
        }

        const total =
          Number(
            payload?.stats?.notionTotal ?? payload?.stats?.firestoreTotal ?? 0
          ) || 0;

        // Let the swallow beat land even when the API answers instantly.
        const elapsed = Date.now() - startedAt;
        if (elapsed < 1100) await sleep(1100 - elapsed);
        if (cancelled.current) return;

        setTarget(total);
        setPhase("drained");

        // Long enough to find and hold a line; the timer freezes on hover.
        await waitHeld(4500);

        if (cancelled.current) return;

        setPhase("done");
        await sleep(2500);
        if (cancelled.current) return;

        setPhase("idle");
        setDigits("");
        setPoems([]);
        setTarget(0);
      } catch (error) {
        console.error("confessional sync failed", error);
        if (cancelled.current) return;
        setNotice("the void is busy.");
        setPhase("idle");
        setDigits("");
        await sleep(2200);
        if (!cancelled.current) setNotice(null);
      } finally {
        inFlight.current = false;
      }
    },
    [failWrong]
  );

  useEffect(() => {
    if (
      digits.length === PIN_LENGTH &&
      (phase === "idle" || phase === "listening") &&
      !inFlight.current
    ) {
      void submit(digits);
    }
  }, [digits, phase, submit]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // While a poem is open, the keyboard belongs to the reader (Escape).
      if (readerRef.current) return;

      // Asleep: the keyboard is not listening. Click the blob to wake it.
      if (asleepRef.current) return;

      // The mobile input owns its own value; don't double-count hardware keys.
      if (document.activeElement === inputRef.current) return;

      const current = phaseRef.current;
      if (LOCKED_PHASES.includes(current)) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        setDigits((value) => value.slice(0, -1));
        bumpActivity();
        return;
      }

      if (event.key === "Escape") {
        setDigits("");
        return;
      }

      if (!/^\d$/.test(event.key)) return;

      event.preventDefault();
      bumpActivity();
      setPhase((value) => (value === "idle" ? "listening" : value));
      setDigits((value) =>
        value.length >= PIN_LENGTH ? value : value + event.key
      );
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bumpActivity]);

  const handleMobileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (asleepRef.current) return;
    if (LOCKED_PHASES.includes(phaseRef.current)) return;

    const next = event.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setDigits(next);
    bumpActivity();
    if (next.length > 0) {
      setPhase((value) => (value === "idle" ? "listening" : value));
    }
  };

  const focusHiddenInput = () => {
    if (!coarse) return;
    if (asleepRef.current) return; // tap the blob first
    inputRef.current?.focus({ preventScroll: true });
  };

  const swallowing = phase === "swallowing" || phase === "drained";

  const headline = swallowing
    ? "feed me."
    : phase === "done"
      ? "thank you. go."
      : phase === "wrong"
        ? "no."
        : "you were not supposed to find this.";

  const status =
    notice ??
    (asleep
      ? coarse
        ? "sleeping. tap the blob."
        : "sleeping. click the blob."
      : phase === "listening"
        ? "listening"
        : swallowing
          ? "swallowing."
          : phase === "done"
            ? "done."
            : phase === "wrong"
              ? "wrong."
              : "waiting...");

  return (
    <main
      onPointerDown={focusHiddenInput}
      className="relative h-dvh w-full overflow-hidden bg-paper text-ink selection:bg-ink selection:text-paper"
      style={{ cursor: coarse ? "auto" : "none" }}
    >
      <style>{GLITCH_CSS}</style>

      <motion.div animate={shake} className="relative h-full w-full">
        <TimeStamp />

        <FallingPoems
          poems={poems}
          active={swallowing}
          paused={reader !== null}
          seed={seed}
          onOpen={openPoem}
          onHoverStart={holdReading}
          onHoverEnd={releaseReading}
        />

        {/* centre stack */}
        <div className="relative flex h-full flex-col items-center justify-center gap-8 px-6 py-14 sm:gap-10">
          <div className="relative z-10">
            <Blob
              mx={mx}
              my={my}
              asleep={asleep}
              phase={phase}
              openCount={digits.length}
              onWake={wake}
            />
          </div>

          <h1
            className="relative z-40 max-w-[92vw] text-center text-[clamp(2.1rem,7vw,5rem)] italic leading-[0.95] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-newsreader)" }}
          >
            <motion.span
              key={headline}
              data-text={headline}
              className={phase === "wrong" ? "qwzx-glitch" : undefined}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
            >
              {headline}
            </motion.span>
          </h1>
        </div>

        {/* swallowed counter */}
        <AnimatePresence>
          {swallowing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-[15vh] z-40 flex flex-col items-center"
            >
              <p className="font-mono text-[11px] tracking-[0.32em] text-faded">
                {phase === "drained" ? (
                  target > 0 ? (
                    <>
                      <Counter
                        value={target}
                        duration={Math.min(1.8, 0.8 + target * 0.008)}
                      />{" "}
                      swallowed...
                    </>
                  ) : (
                    "nothing to swallow."
                  )
                ) : (
                  "swallowing..."
                )}
              </p>
              {phase === "drained" && (
                <p className="mt-3 font-mono text-[9px] tracking-[0.28em] text-faded">
                  hold 1s to read
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p
          aria-live="polite"
          className="pointer-events-none absolute bottom-4 right-4 z-50 font-mono text-[10px] tracking-[0.2em] text-faded sm:bottom-5 sm:right-5 sm:text-[11px] sm:tracking-[0.22em]"
        >
          {status}
        </p>
      </motion.div>

      <EyeCursor />
      <Grain />
      <PoemReader poem={reader} onClose={closePoem} />

      <AnimatePresence>
        {flash && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[80]"
            style={{ backgroundColor: "var(--error)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.16 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* No visible field. Keyboard capture is the interface; on touch this
          off-screen input opens the numeric keyboard after the first tap. */}
      <input
        ref={inputRef}
        value={digits}
        onChange={handleMobileInput}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={PIN_LENGTH}
        aria-label="six digit sync code"
        className="pointer-events-none fixed left-1/2 top-1/2 h-px w-px -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-transparent caret-transparent opacity-0 outline-none"
        style={{ fontSize: 16 }}
      />
    </main>
  );
}
