import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function migrateLikes(fromUID: string, toUID: string) {
  const likesRef = collection(db, "likes");
  const q = query(likesRef, where("userId", "==", fromUID));
  const snapshot = await getDocs(q);

  const batchLikes = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    return addDoc(likesRef, {
      poemId: data.poemId,
      userId: toUID,
      timestamp: data.timestamp,
    });
  });

  await Promise.all(batchLikes);
  console.log("✅ Likes migrated from", fromUID, "→", toUID);
}