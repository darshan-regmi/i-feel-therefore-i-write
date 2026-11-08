"use client";

import { useCallback, useEffect, useRef } from "react";

// One snore every ~3.8s: a filtered breath with a sawtooth rasp under it.
const SNORE_PERIOD_MS = 3800;
const SNORE_LENGTH_S = 2.3;

type AudioContextCtor = typeof AudioContext;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext;

  if (!Ctor) return null;

  try {
    return new Ctor();
  } catch {
    return null;
  }
}

/** White noise, long enough for one breath. */
function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * SNORE_LENGTH_S);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

/**
 * Schedule one breath.
 *
 * Two layers, both audible on laptop and phone speakers:
 *  - a band of noise sweeping 300 → 1100 → 420 Hz (the air moving), and
 *  - a 92 → 64 Hz sawtooth lowpassed at 420 Hz (the throat), at a lower gain.
 * The whole thing runs through a master envelope so it fades in and out.
 */
function snore(ctx: AudioContext, when: number, buffer: AudioBuffer) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, when);
  master.gain.exponentialRampToValueAtTime(0.7, when + 0.55);
  master.gain.exponentialRampToValueAtTime(0.38, when + 1.35);
  master.gain.exponentialRampToValueAtTime(0.0001, when + 2.2);
  master.connect(ctx.destination);

  // Breath.
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.7;
  band.frequency.setValueAtTime(300, when);
  band.frequency.exponentialRampToValueAtTime(1100, when + 0.75);
  band.frequency.exponentialRampToValueAtTime(420, when + 2.0);

  source.connect(band);
  band.connect(master);

  // Throat.
  const rasp = ctx.createOscillator();
  rasp.type = "sawtooth";
  rasp.frequency.setValueAtTime(92, when);
  rasp.frequency.exponentialRampToValueAtTime(64, when + 2.0);

  const raspFilter = ctx.createBiquadFilter();
  raspFilter.type = "lowpass";
  raspFilter.frequency.value = 420;

  const raspGain = ctx.createGain();
  raspGain.gain.setValueAtTime(0.0001, when);
  raspGain.gain.exponentialRampToValueAtTime(0.45, when + 0.6);
  raspGain.gain.exponentialRampToValueAtTime(0.12, when + 1.45);
  raspGain.gain.exponentialRampToValueAtTime(0.0001, when + 2.15);

  rasp.connect(raspFilter);
  raspFilter.connect(raspGain);
  raspGain.connect(master);

  source.start(when);
  source.stop(when + SNORE_LENGTH_S);
  rasp.start(when);
  rasp.stop(when + SNORE_LENGTH_S);
}

/**
 * A short, groggy hum when the blob is woken. It doubles as proof that audio
 * is actually unlocked — the first sleep cycle can happen before the browser
 * will let a page make any sound at all.
 */
function stir(ctx: AudioContext, when: number) {
  const osc = ctx.createOscillator();
  // Triangle, not sine: the harmonics are what make a low hum audible on a
  // laptop or phone speaker.
  osc.type = "triangle";
  osc.frequency.setValueAtTime(140, when);
  osc.frequency.exponentialRampToValueAtTime(210, when + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.1, when + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.42);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + 0.5);
}

/**
 * Snoring while the blob sleeps.
 *
 * Audio is synthesised, so there is no asset to load. The AudioContext is
 * created on the first gesture and resumed on every subsequent one until it is
 * actually running — browsers hand back a suspended context otherwise, and a
 * suspended context is the usual reason a page like this is silent.
 */
export default function useSnoring(active: boolean): () => void {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlock = () => {
      let ctx = ctxRef.current;

      if (!ctx) {
        ctx = getAudioContext();
        if (!ctx) return;
        ctxRef.current = ctx;
        bufferRef.current = noiseBuffer(ctx);
      }

      if (ctx.state !== "running") {
        void ctx.resume().catch(() => {});
      }
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "pointerup",
      "click",
      "keydown",
      "touchstart",
    ];

    for (const event of events) {
      window.addEventListener(event, unlock, { passive: true });
    }

    const onVisible = () => {
      if (!document.hidden) unlock();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      for (const event of events) {
        window.removeEventListener(event, unlock);
      }
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const breathe = () => {
      const ctx = ctxRef.current;
      const buffer = bufferRef.current;

      if (ctx && buffer && !document.hidden) {
        // A context can fall back to suspended (iOS does this when the page
        // is backgrounded). Resume and schedule anyway; the graph starts as
        // soon as the clock is running again.
        if (ctx.state === "suspended") void ctx.resume().catch(() => {});
        snore(ctx, ctx.currentTime + 0.03, buffer);
      }

      timerRef.current = window.setTimeout(breathe, SNORE_PERIOD_MS);
    };

    // Let the slump land before the first breath.
    timerRef.current = window.setTimeout(breathe, 320);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active]);

  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      bufferRef.current = null;
      if (ctx) void ctx.close().catch(() => {});
    };
  }, []);

  // Called by the page when the blob is woken. The click itself is the gesture,
  // so this is also where a page that has never made a sound gets its context.
  return useCallback(() => {
    let ctx = ctxRef.current;

    if (!ctx) {
      ctx = getAudioContext();
      if (!ctx) return;
      ctxRef.current = ctx;
      bufferRef.current = noiseBuffer(ctx);
    }

    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    stir(ctx, ctx.currentTime + 0.02);
  }, []);
}
