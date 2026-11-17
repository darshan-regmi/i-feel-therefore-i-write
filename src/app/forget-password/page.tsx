import { Suspense } from "react";
import AuthForm from "@/components/journal/AuthForm";
import PageShell from "@/components/journal/PageShell";

export default function ForgetPasswordPage() {
  return (
    <PageShell parent="/login">
      <h1 className="page-title">forget password</h1>
      <p className="page-intro">
        tell us the address and we’ll send a reset letter.
      </p>
      <Suspense fallback={<p className="meta auth-status">checking…</p>}>
        <AuthForm mode="reset" />
      </Suspense>
    </PageShell>
  );
}
