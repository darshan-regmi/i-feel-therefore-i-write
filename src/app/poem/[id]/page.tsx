import { notFound, permanentRedirect } from "next/navigation";
import { getPoem } from "@/lib/poems";
import { poemHref } from "@/lib/journal";

export const runtime = "edge";

/**
 * Old ID-based poem URLs stay alive forever. The stable Notion id resolves the
 * current canonical title slug at /entries/<slug>-<id>.
 */
export default async function LegacyPoemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poem = await getPoem(id);

  if (!poem) {
    notFound();
  }

  permanentRedirect(poemHref(poem));
}
