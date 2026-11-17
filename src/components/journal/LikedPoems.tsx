"use client";

import { useEffect, useState } from "react";
import { getLikedPoemIds } from "@/lib/likes";
import IndexRow from "./IndexRow";

export type LikedPoemItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
};

export default function LikedPoems({
  uid,
  items,
  emptyMessage,
}: {
  uid: string;
  items: LikedPoemItem[];
  emptyMessage: string;
}) {
  const [likedIds, setLikedIds] = useState<Set<string> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getLikedPoemIds(uid)
      .then((ids) => {
        if (!cancelled) setLikedIds(new Set(ids));
      })
      .catch((error) => {
        console.error("could not read liked poems", error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (failed) {
    return <p className="meta">couldn’t read your likes just now. try again.</p>;
  }

  if (likedIds === null) {
    return <p className="meta">gathering the poems you kept…</p>;
  }

  const liked = items.filter((item) => likedIds.has(item.id));

  if (liked.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div>
      {liked.map((item) => (
        <IndexRow
          key={item.id}
          meta={item.meta}
          title={item.title}
          href={item.href}
        />
      ))}
    </div>
  );
}
