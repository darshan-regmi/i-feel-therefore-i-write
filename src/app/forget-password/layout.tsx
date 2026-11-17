import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forget password",
  description: "Ask for a password reset letter.",
  robots: { index: false, follow: false },
};

export default function ForgetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
