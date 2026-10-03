import type { Metadata } from "next";

/** page.tsx is a client component, so its metadata lives here instead. */
export const metadata: Metadata = {
  title: "Log in",
  // Unique per visitor and no search value — keep it out of the index.
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}