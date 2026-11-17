"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LikedPoems, { type LikedPoemItem } from "./LikedPoems";
import TextButton from "./TextButton";
import { useSignedInUser } from "./useSignedInUser";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ProfileView({ items }: { items: LikedPoemItem[] }) {
  const router = useRouter();
  const { user, ready } = useSignedInUser("/profile");
  const [signingOut, setSigningOut] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationNote, setVerificationNote] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  if (!ready || !user) {
    return <p className="meta">taking you to log in…</p>;
  }

  const needsVerification =
    user.providerData.some((provider) => provider.providerId === "password") &&
    !user.emailVerified;

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("could not sign out", error);
      setSigningOut(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);

    try {
      await sendEmailVerification(user);
      setVerificationNote("the letter is on its way.");
    } catch (error) {
      console.error("could not resend verification", error);
      setVerificationNote("couldn’t send that just now. try again later.");
    } finally {
      setResending(false);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  return (
    <>
      <div className="profile-block">
        <span className="profile-label meta">email</span>
        <p className="profile-email no-lowercase">{user.email ?? "—"}</p>

        {needsVerification ? (
          <div className="auth-note" role="status">
            <p>
              your email isn’t confirmed yet. follow the link we sent to finish
              setting up your account.
            </p>
            <div className="auth-note-actions">
              <TextButton
                type="button"
                variant="underline"
                disabled={resending || cooldown > 0}
                onClick={handleResend}
              >
                {resending
                  ? "sending…"
                  : cooldown > 0
                    ? `resend in ${cooldown}s`
                    : "resend email"}
              </TextButton>
              {verificationNote ? (
                <span className="meta">{verificationNote}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="profile-block">
        <TextButton
          type="button"
          variant="plain"
          disabled={signingOut}
          onClick={handleSignOut}
        >
          {signingOut ? "signing out…" : "sign out"}
        </TextButton>
      </div>

      <section className="section-gap" aria-label="liked poems">
        <h2 className="month-heading">liked</h2>
        <LikedPoems
          uid={user.uid}
          items={items}
          emptyMessage="nothing kept yet. like a poem and it will wait here."
        />
      </section>
    </>
  );
}
