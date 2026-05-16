"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
};

const LikedPoemsContext = createContext<LikedPoemsContextValue | null>(null);

export function LikedPoemsProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [likedSet, setLikedSet] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      try {
        let currentUid = user?.uid ?? null;
        if (!currentUid) {
          const result = await signInAnonymously(auth);
          currentUid = result.user.uid;
        }
        if (cancelled) return;
        setUid(currentUid);

        const likedIds = await getUserLikedPoems(currentUid);
        if (cancelled) return;
        setLikedSet(new Set(likedIds));
      } catch (error) {
        console.error("LikedPoemsProvider: failed to initialise", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
    <LikedPoemsContext.Provider value={{ uid, ready, isLiked, markLiked }}>
      {children}
    </LikedPoemsContext.Provider>
  );
}

// Returns the context, or null if no provider is mounted. Components should
// fall back to per-instance fetching when this is null.
export function useLikedPoems(): LikedPoemsContextValue | null {
  return useContext(LikedPoemsContext);
}
