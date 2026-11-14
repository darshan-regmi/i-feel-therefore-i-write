import {
  doc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

const LIKES_COLLECTION = "likes";

/**
 * The anonymous session whose likes should follow the visitor into a real
 * account. Capture this before signing in: the rules only let you read your own
 * likes, so after the uid changes the old rows are no longer readable.
 */
export type AnonymousLikesSnapshot = {
  uid: string;
  poemIds: string[];
};

/**
 * Copy an anonymous visitor's likes onto their new account.
 *
 * One idempotent `set` per poem, with the doc id the rules require. The old
 * anonymous docs are deliberately left in place: only their owner can delete
 * them, and they already contributed to the poem's stored like counter, so
 * touching the counter here would count each migrated like twice.
 *
 * Returns the number of likes written.
 */
export async function migrateLikes(
  snapshot: AnonymousLikesSnapshot,
  toUID: string,
  store: Firestore
): Promise<number> {
  const { uid: fromUID, poemIds } = snapshot;

  if (fromUID === toUID || poemIds.length === 0) return 0;

  const batch = writeBatch(store);

  for (const poemId of poemIds) {
    // The rules require likes/{poemId}_{uid} with a matching userId and a
    // timestamp, so `set` works both for new likes and for reruns.
    batch.set(doc(store, LIKES_COLLECTION, `${poemId}_${toUID}`), {
      poemId,
      userId: toUID,
      timestamp: new Date(),
    });
  }

  await batch.commit();
  console.log(`✅ Migrated ${poemIds.length} likes from ${fromUID} → ${toUID}`);

  return poemIds.length;
}
