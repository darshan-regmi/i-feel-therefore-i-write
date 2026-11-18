"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

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
    try {
      return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
        setUser(nextUser && !nextUser.isAnonymous ? nextUser : null);
        setReady(true);
      });
    } catch (error) {
      // Missing Firebase config in a preview should render a signed-out state,
      // not leave the page waiting forever.
      console.error("could not start the auth session", error);
      setReady(true);
      return;
    }
  }, []);

  useEffect(() => {
    if (!ready || user) return;
    router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
  }, [ready, user, loginNext, router]);

  return { user, ready };
}
