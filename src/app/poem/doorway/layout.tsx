import type { Metadata } from "next";

// Legacy hand-coded poem route. Keep accessible but don't compete with the
// Notion-served `/poem/[id]` URLs in search.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function DoorwayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
