"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";

/**
 * Liking never asks for an account: the first visit to a poem opens an
 * anonymous Firebase session, so the heart works straight away. Those likes
 * follow the visitor into a real account when they sign in to view /liked.
 *
 * Firebase and Firestore are imported after mount so the poem page's initial
 * JavaScript stays small; the count appears as soon as they resolve.
 */
export default function LikeButton({ poemId }: { poemId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIdRef = useRef(0);

  // Restore this device's session, or create an anonymous one so a like does
  // not need a sign-up. A failed attempt leaves the button usable: clicking it
  // tries again.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const [{ getFirebaseAuth }, { onAuthStateChanged }, { ensureUid }] =
        await Promise.all([
          import("@/lib/firebase"),
          import("firebase/auth"),
          import("@/lib/likes"),
        ]);
      if (cancelled) return;

      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
        setUser(nextUser);
        setReady(true);

        if (!nextUser) {
          ensureUid().catch((authError) => {
            console.error("could not start an anonymous session", authError);
          });
        }
      });
    })().catch((authError) => {
      console.error("could not start the like session", authError);
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const uid = user?.uid ?? null;

  useEffect(() => {
    const loadId = ++loadIdRef.current;
    let cancelled = false;

    setCount(null);
    setLiked(false);
    setError(null);

    (async () => {
      const { getLikeCount, isPoemLiked } = await import("@/lib/likes");
      const [likes, hasLiked] = await Promise.all([
        getLikeCount(poemId),
        uid ? isPoemLiked(poemId, uid) : Promise.resolve(false),
      ]);

      if (cancelled || loadId !== loadIdRef.current) return;
      setCount(likes);
      setLiked(hasLiked);
    })().catch((loadError) => {
      console.error("could not load the like state", loadError);
      if (!cancelled && loadId === loadIdRef.current) setCount(0);
    });

    return () => {
      cancelled = true;
    };
  }, [poemId, uid]);

  const handleToggle = async () => {
    if (busy) return;

    const previousLiked = liked;
    const previousCount = count ?? 0;

    // Invalidate any in-flight initial read so it cannot overwrite the result.
    loadIdRef.current += 1;

    setBusy(true);
    setError(null);
    setLiked(!previousLiked);
    setCount(Math.max(0, previousCount + (previousLiked ? -1 : 1)));

    try {
      const { ensureUid, togglePoemLike } = await import("@/lib/likes");
      const owner = user?.uid ?? (await ensureUid());
      const result = await togglePoemLike(poemId, owner);
      setLiked(result.liked);
      setCount(result.likes);
    } catch (toggleError) {
      console.error("could not toggle the like", toggleError);
      setLiked(previousLiked);
      setCount(previousCount);
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "couldn’t update the like. try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const countLabel = count === null ? "—" : String(count);

  if (!ready) {
    return (
      <span className="like-button meta" aria-hidden="true">
        <span className="like-heart">♡</span> —
      </span>
    );
  }

  return (
    <div className="like-wrap">
      <button
        type="button"
        className="like-button"
        onClick={handleToggle}
        disabled={busy}
        aria-pressed={liked}
        aria-label={`${liked ? "unlike" : "like"} this poem (${count ?? 0} likes)`}
      >
        <span className="like-heart" aria-hidden="true">
          {liked ? "♥" : "♡"}
        </span>
        <span className="meta">{countLabel}</span>
      </button>
      {error ? (
        <p className="error-text like-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
