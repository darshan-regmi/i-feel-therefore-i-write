import type { Metadata } from "next";
import { entryShortMeta, poemHref } from "@/lib/journal";
import { getEntries } from "@/lib/poems";
import LikedView from "@/components/journal/LikedView";
import PageShell from "@/components/journal/PageShell";

export const revalidate = 300;
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Liked poems",
  description: "The poems you kept.",
  robots: { index: false, follow: false },
};

export default async function LikedPage() {
  const entries = await getEntries();
  const items = entries.map((entry) => ({
    id: entry.poem.id,
    title: entry.poem.title,
    meta: entryShortMeta(entry),
    href: poemHref(entry.poem),
  }));

  return (
    <PageShell parent="/home">
      <h1 className="page-title">liked</h1>
      <p className="page-intro">the poems you kept.</p>
      <div className="section-gap">
        <LikedView items={items} />
      </div>
    </PageShell>
  );
}
