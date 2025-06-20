import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function migrateLikes(fromUID: string, toUID: string) {
  if (fromUID === toUID) return;

  const likesRef = collection(db, "likes");
  const fromLikesQ = query(likesRef, where("userId", "==", fromUID));
  const fromLikesSnap = await getDocs(fromLikesQ);

  const toLikesQ = query(likesRef, where("userId", "==", toUID));
  const toLikesSnap = await getDocs(toLikesQ);

  // Create a Set of existing poemIds for toUID
  const toLikedPoemIds = new Set(
    toLikesSnap.docs.map((doc) => doc.data().poemId)
  );

  const migrateOps = fromLikesSnap.docs.map(async (docSnap) => {
    const { poemId, timestamp } = docSnap.data();

    if (!toLikedPoemIds.has(poemId)) {
      await addDoc(likesRef, {
        poemId,
        userId: toUID,
        timestamp,
      });
    }
  });

  await Promise.all(migrateOps);
  console.log(`✅ Migrated ${migrateOps.length} likes from ${fromUID} → ${toUID}`);
}