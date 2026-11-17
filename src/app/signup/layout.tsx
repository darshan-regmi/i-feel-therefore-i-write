import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Make an account to keep the poems you love close.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
