import type { Metadata } from "next";
import { entryShortMeta, poemHref } from "@/lib/journal";
import { getEntries } from "@/lib/poems";
import PageShell from "@/components/journal/PageShell";
import ProfileView from "@/components/journal/ProfileView";

export const revalidate = 300;
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account and the poems you kept.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const entries = await getEntries();
  const items = entries.map((entry) => ({
    id: entry.poem.id,
    title: entry.poem.title,
    meta: entryShortMeta(entry),
    href: poemHref(entry.poem),
  }));

  return (
    <PageShell parent="/home">
      <h1 className="page-title">profile</h1>
      <p className="page-intro">your account, and the poems you kept.</p>
      <ProfileView items={items} />
    </PageShell>
  );
}
