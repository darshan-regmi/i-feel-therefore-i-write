import { Suspense } from "react";
import AuthForm from "@/components/journal/AuthForm";
import PageShell from "@/components/journal/PageShell";

export default function LoginPage() {
  return (
    <PageShell parent="/home">
      <h1 className="page-title">log in</h1>
      <p className="page-intro">
        welcome back. the poems you kept are still here.
      </p>
      <Suspense fallback={<p className="meta auth-status">checking…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </PageShell>
  );
}
