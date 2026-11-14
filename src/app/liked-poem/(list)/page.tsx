"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { resetAuthCache } from "@/lib/likes";
import { useLikedPoems } from "@/components/LikedPoemsProvider";
import { X } from "lucide-react";
import Link from "next/link";
import PoemsWrapper from "@/components/PoemsWrapper_1";

const RESEND_COOLDOWN_SECONDS = 60;

export default function LikedPoemPage() {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationDismissed, setVerificationDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const likedPoems = useLikedPoems();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) {
        router.push("/login");
      } else {
        // Google accounts are verified by the provider; only a password
        // account can be sitting here with an unconfirmed address.
        const hasPasswordProvider = user.providerData.some(
          (provider) => provider.providerId === "password"
        );
        setNeedsVerification(hasPasswordProvider && !user.emailVerified);

        const fetchPoems = async () => {
          try {
            const res = await fetch("/api/poem");
            const data = await res.json();

            // ✅ Extract array safely
            const poemsArray = Array.isArray(data.poems) ? data.poems : [];
            setPoems(poemsArray);
          } catch (err) {
            console.error("Failed to fetch poems:", err);
            setPoems([]); // fallback
          } finally {
            setLoading(false);
          }
        };

        fetchPoems();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await signOut(auth);
      // The cached uid belongs to the signed-out session; without this the
      // next visitor would keep using it for like lookups.
      resetAuthCache();
      likedPoems?.clearLikes();
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (!user || resending || resendCooldown > 0) return;

    setResending(true);

    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error("Could not resend verification email:", error);
    } finally {
      setResending(false);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-black flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/30 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-3xl space-y-6">
          {/* Multiple skeleton cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border border-gray-200 animate-pulse bg-white shadow-sm"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Title Skeleton */}
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-6"></div>

              {/* Poem Skeleton Lines */}
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-100 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
              </div>

              {/* Footer Skeleton */}
              <div className="mt-6 flex justify-between items-center">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}

          {/* Loading Hint */}
          <p className="text-center text-sm font-light italic text-gray-500 animate-pulse pt-4">
            gathering the poems you loved...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-gray-900 flex flex-col items-center p-6 sm:p-8">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/30 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Navigation */}
        <nav className="flex justify-between items-center w-full mb-12">
          <Link
            href="/poem"
            aria-label="Go back to poems"
            className="group flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-all duration-300"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span className="font-medium">back to poems</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm italic text-gray-500 hover:text-gray-900 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signingOut ? "signing out..." : "sign out"}
          </button>
        </nav>

        {/* Unverified password account. Dismissible: it is a reminder, not a
            gate, so the poems stay reachable either way. */}
        {needsVerification && !verificationDismissed && (
          <div
            role="status"
            className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"
          >
            <p className="flex-1 italic">
              Your email isn&#39;t confirmed yet. Follow the link we sent to
              finish setting up your home.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending || resendCooldown > 0}
              className="shrink-0 text-sm font-medium text-amber-800 underline underline-offset-4 hover:text-amber-950 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:no-underline"
            >
              {resending
                ? "sending..."
                : resendCooldown > 0
                  ? `resend in ${resendCooldown}s`
                  : "resend email"}
            </button>
            <button
              type="button"
              onClick={() => setVerificationDismissed(true)}
              aria-label="Dismiss verification reminder"
              className="shrink-0 self-start sm:self-auto text-amber-500 hover:text-amber-800 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-serif text-gray-900 tracking-tight">
            liked poems
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light italic max-w-2xl mx-auto">
            bits of emotion you&#39;ve carried, now kept in your heart.
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>
        </header>

        {/* Poems Content */}
        <div className="mt-8">
          <PoemsWrapper poems={poems} />
        </div>
      </div>
    </main>
  );
}
