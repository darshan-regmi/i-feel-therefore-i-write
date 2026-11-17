import { Suspense } from "react";
import AuthForm from "@/components/journal/AuthForm";
import PageShell from "@/components/journal/PageShell";

export default function SignupPage() {
  return (
    <PageShell parent="/home">
      <h1 className="page-title">sign up</h1>
      <p className="page-intro">make a home for the poems you keep.</p>
      <Suspense fallback={<p className="meta auth-status">checking…</p>}>
        <AuthForm mode="signup" />
      </Suspense>
    </PageShell>
  );
}
