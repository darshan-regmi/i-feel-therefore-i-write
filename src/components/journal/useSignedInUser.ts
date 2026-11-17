"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Resolves the current non-anonymous account. Visitors without one are sent to
 * the login page and returned to `loginNext` afterwards.
 */
export function useSignedInUser(loginNext: string): {
  user: User | null;
  ready: boolean;
} {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser && !nextUser.isAnonymous ? nextUser : null);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || user) return;
    router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
  }, [ready, user, loginNext, router]);

  return { user, ready };
}
