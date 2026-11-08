import { notFound } from "next/navigation";
import { getPoemById } from "@/lib/notion";

/**
 * Existence check for /poem/[id].
 *
 * This deliberately lives in the layout rather than only in the page. Next
 * renders a segment's `layout.tsx` OUTSIDE that segment's `loading.tsx`
 * Suspense boundary, and the HTTP status is committed when the shell flushes.
 * `loading.tsx` lets Next flush the shell (with the skeleton, status 200)
 * before `page.tsx` has resolved — so a `notFound()` thrown from the page
 * arrived too late and every /poem/<anything> returned 200 instead of 404.
 *
 * Running the check here means it completes before that boundary exists, so
 * the response status is still ours to set. `page.tsx` keeps its own null
 * check for type-narrowing, but in practice a missing poem never reaches it.
 *
 * The lookup is cached (`getPoemById` memoises and revalidate=60), so this
 * does not double the Notion traffic.
 */
export default async function PoemLayout({
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
