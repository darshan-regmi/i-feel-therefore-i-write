"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Firebase is imported after mount so the static home page never pays for the
 * auth SDK before hydration.
 */
export default function AuthLink() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const [{ auth }, { onAuthStateChanged }] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/auth"),
      ]);
      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, (user) => {
        setSignedIn(Boolean(user && !user.isAnonymous));
      });
    })().catch(() => {
      if (!cancelled) setSignedIn(false);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (signedIn === null) {
    return <span className="auth-placeholder" aria-hidden="true" />;
  }

  return (
    <Link href={signedIn ? "/profile" : "/login"}>
      {signedIn ? "profile" : "log in"}
    </Link>
  );
}
