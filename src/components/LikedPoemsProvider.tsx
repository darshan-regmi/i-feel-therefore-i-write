"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserLikedPoems } from "@/lib/likes";

type LikedPoemsContextValue = {
  uid: string | null;
  ready: boolean;
  isLiked: (poemId: string) => boolean;
  markLiked: (poemId: string, liked: boolean) => void;
  /** Drop all in-memory likes; used when the session changes or signs out. */
  clearLikes: () => void;
};

const LikedPoemsContext = createContext<LikedPoemsContextValue | null>(null);

export function LikedPoemsProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [likedSet, setLikedSet] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  // Incremented whenever a session is abandoned, so a slow fetch for the old
  // uid cannot repopulate the new user's state.
  const generationRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      const generation = ++generationRef.current;

      try {
        let currentUid = user?.uid ?? null;
        if (!currentUid) {
          const result = await signInAnonymously(auth);
          currentUid = result.user.uid;
        }
        if (cancelled || generation !== generationRef.current) return;

        // Never let the previous session's likes survive a uid change.
        setUid(currentUid);
        setLikedSet(new Set());

        const likedIds = await getUserLikedPoems(currentUid);
        if (cancelled || generation !== generationRef.current) return;
        setLikedSet(new Set(likedIds));
      } catch (error) {
        console.error("LikedPoemsProvider: failed to initialise", error);
      } finally {
        if (!cancelled && generation === generationRef.current) {
          setReady(true);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const clearLikes = useCallback(() => {
    generationRef.current++;
    setUid(null);
    setLikedSet(new Set());
    setReady(false);
  }, []);

  const isLiked = useCallback((id: string) => likedSet.has(id), [likedSet]);

  const markLiked = useCallback((id: string, liked: boolean) => {
    setLikedSet((prev) => {
      const next = new Set(prev);
      if (liked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  return (
    <LikedPoemsContext.Provider
      value={{ uid, ready, isLiked, markLiked, clearLikes }}
    >
      {children}
    </LikedPoemsContext.Provider>
  );
}

// Returns the context, or null if no provider is mounted. Components should
// fall back to per-instance fetching when this is null.
export function useLikedPoems(): LikedPoemsContextValue | null {
  return useContext(LikedPoemsContext);
}
