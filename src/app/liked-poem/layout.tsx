import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liked Poems",
  robots: { index: false, follow: true },
};

export default function LikedPoemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
