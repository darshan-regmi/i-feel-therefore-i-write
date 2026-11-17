import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const LIKES = "likes";
const POEMS = "poems";

export type LikeRecord = {
  userId: string;
  poemId: string;
  /** Kept as a Firestore timestamp value; only its presence is required. */
  timestamp: unknown;
};

function likeId(poemId: string, uid: string): string {
  return `${poemId}_${uid}`;
}

/** Every poem id this account has liked. */
export async function getLikedPoemIds(uid: string): Promise<string[]> {
  if (!uid) return [];

  const snapshot = await getDocs(
    query(collection(db, LIKES), where("userId", "==", uid))
  );

  return snapshot.docs
    .map((like) => like.data().poemId)
    .filter((poemId): poemId is string => typeof poemId === "string");
}

/** The stored counter on `poems/{id}`. Missing docs read as zero. */
export async function getLikeCount(poemId: string): Promise<number> {
  try {
    const snapshot = await getDoc(doc(db, POEMS, poemId));
    const value = snapshot.data()?.likes;
    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? value
      : 0;
  } catch (error) {
    console.error("could not read like count", error);
    return 0;
  }
}

export async function isPoemLiked(poemId: string, uid: string): Promise<boolean> {
  if (!uid) return false;

  try {
    const snapshot = await getDoc(doc(db, LIKES, likeId(poemId, uid)));
    return snapshot.exists();
  } catch (error) {
    console.error("could not read like state", error);
    return false;
  }
}

/**
 * Toggles `likes/{poemId}_{uid}` and `poems/{poemId}.likes` in one batch, so
 * the counter and the per-user record cannot disagree. Existing records from
 * before the redesign use the same shape and keep working.
 */
export async function togglePoemLike(
  poemId: string,
  uid: string
): Promise<{ liked: boolean; likes: number }> {
  if (!poemId || !uid) {
    throw new Error("missing poem or account");
  }

  const likeRef = doc(db, LIKES, likeId(poemId, uid));
  const poemRef = doc(db, POEMS, poemId);

  const [like, poem] = await Promise.all([getDoc(likeRef), getDoc(poemRef)]);

  if (!poem.exists()) {
    throw new Error("this poem isn’t ready for likes yet. try again later.");
  }

  const currentLikes =
    typeof poem.data()?.likes === "number" ? (poem.data()!.likes as number) : 0;
  const batch = writeBatch(db);

  if (like.exists()) {
    batch.delete(likeRef);
    // A missing or already-zero counter must not block removing the record:
    // the rules reject a stored negative count.
    if (currentLikes > 0) {
      batch.update(poemRef, { likes: increment(-1) });
    }
    await batch.commit();
    return { liked: false, likes: Math.max(0, currentLikes - 1) };
  }

  const record: LikeRecord = {
    userId: uid,
    poemId,
    timestamp: new Date(),
  };
  batch.set(likeRef, record);
  batch.update(poemRef, { likes: increment(1) });
  await batch.commit();

  return { liked: true, likes: currentLikes + 1 };
}

/** Remove every like owned by this account, in batches the rules allow. */
export async function deleteOwnLikes(uid: string): Promise<void> {
  if (!uid) return;

  const snapshot = await getDocs(
    query(collection(db, LIKES), where("userId", "==", uid))
  );

  const refs = snapshot.docs.map((like) => like.ref);
  for (let index = 0; index < refs.length; index += 450) {
    const batch = writeBatch(db);
    for (const ref of refs.slice(index, index + 450)) {
      batch.delete(ref);
    }
    await batch.commit();
  }
}
