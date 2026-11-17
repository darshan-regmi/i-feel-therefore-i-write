"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

/**
 * Firebase and Firestore are imported after mount so the poem page's initial
 * JavaScript stays small; the count appears as soon as they resolve.
 */
export default function LikeButton({ poemId }: { poemId: string }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/auth"),
      ]);
      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser && !nextUser.isAnonymous ? nextUser : null);
        setReady(true);
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

  useEffect(() => {
    let cancelled = false;

    setCount(null);
    setLiked(false);
    setError(null);

    (async () => {
      const { getLikeCount, isPoemLiked } = await import("@/lib/likes");
      const [likes, hasLiked] = await Promise.all([
        getLikeCount(poemId),
        user ? isPoemLiked(poemId, user.uid) : Promise.resolve(false),
      ]);

      if (cancelled) return;
      setCount(likes);
      setLiked(hasLiked);
    })().catch((loadError) => {
      console.error("could not load the like state", loadError);
      if (!cancelled) setCount(0);
    });

    return () => {
      cancelled = true;
    };
  }, [poemId, user]);

  const handleToggle = async () => {
    if (!user || busy) return;

    const previousLiked = liked;
    const previousCount = count ?? 0;

    setBusy(true);
    setError(null);
    setLiked(!previousLiked);
    setCount(Math.max(0, previousCount + (previousLiked ? -1 : 1)));

    try {
      const { togglePoemLike } = await import("@/lib/likes");
      const result = await togglePoemLike(poemId, user.uid);
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

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="like-button plain-link"
        aria-label={`log in to like this poem (${count ?? 0} likes)`}
      >
        <span className="like-heart" aria-hidden="true">
          ♡
        </span>
        <span className="meta">{countLabel}</span>
      </Link>
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
