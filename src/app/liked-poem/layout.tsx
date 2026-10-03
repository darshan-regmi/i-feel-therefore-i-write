import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

/** page.tsx is a client component, so its metadata lives here instead. */
export const metadata: Metadata = {
  title: "Liked poems",
  // Signed-in only: every visitor sees a different list, so there is nothing
  // stable to index. /liked-poem/[id] canonicalises to its public /poem/[id].
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/poem` },
};

export default function LikedPoemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}