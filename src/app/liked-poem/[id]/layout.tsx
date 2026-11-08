import { notFound } from "next/navigation";
import { getPoemById } from "@/lib/notion";

/**
 * Existence check for /liked-poem/[id].
 *
 * Same reasoning as app/poem/[id]/layout.tsx: a segment's layout renders
 * outside its own `loading.tsx` boundary, so `notFound()` here still sets a
 * real 404. Doing this only in page.tsx would let the loading skeleton flush
 * first and every /liked-poem/<anything> would answer 200.
 *
 * This route is noindex regardless, but a soft 404 is still a soft 404 —
 * crawlers that reach it via a share link should get a definitive answer.
 */
export default async function LikedPoemLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let poem = null;
  try {
    poem = await getPoemById(id);
  } catch {
    poem = null;
  }

  if (!poem) {
    notFound();
  }

  return <>{children}</>;
}
