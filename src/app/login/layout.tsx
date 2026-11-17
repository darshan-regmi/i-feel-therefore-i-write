import type { Metadata } from "next";

/** Auth pages are unique per visitor and have no search value. */
export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to keep the poems you love close.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
