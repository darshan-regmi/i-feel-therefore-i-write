"use client";

import LikedPoems, { type LikedPoemItem } from "./LikedPoems";
import { useSignedInUser } from "./useSignedInUser";

export default function LikedView({ items }: { items: LikedPoemItem[] }) {
  const { user, ready } = useSignedInUser("/liked");

  if (!ready || !user) {
    return <p className="meta">taking you to log in…</p>;
  }

  return (
    <LikedPoems
      uid={user.uid}
      items={items}
      emptyMessage="nothing kept yet. like a poem and it will wait here."
    />
  );
}
