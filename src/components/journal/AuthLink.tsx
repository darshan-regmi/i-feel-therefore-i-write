"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthLink() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <span className="auth-placeholder" aria-hidden="true" />;
  }

  return (
    <Link href={user ? "/profile" : "/login"}>{user ? "profile" : "log in"}</Link>
  );
}
