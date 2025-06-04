import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';

const LIKES_COLLECTION = 'likes';
const POEMS_COLLECTION = 'poems';

// Ensure anonymous sign-in
export const ensureAuth = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        resolve();
        unsubscribe();
      } else {
        try {
          await signInAnonymously(auth);
          resolve();
          unsubscribe();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

// Get if user has liked the poem
export const getUserLikeStatus = async (poemId: string): Promise<boolean> => {
  await ensureAuth(); // now waits until auth.currentUser is ready
  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  const userLikeRef = doc(db, 'likes', `${uid}-${poemId}`);
  const userLikeDoc = await getDoc(userLikeRef);
  return userLikeDoc.exists();
};

// Toggle like
export const toggleLike = async (poemId: string) => {
  await ensureAuth();

  const likesRef = collection(db, LIKES_COLLECTION);
  const userLikeRef = doc(likesRef, `${auth.currentUser?.uid}-${poemId}`);
  const poemRef = doc(db, POEMS_COLLECTION, poemId);

  const userLikeDoc = await getDoc(userLikeRef);

  // Get or create the poem document
  const poemDoc = await getDoc(poemRef);
  if (!poemDoc.exists()) {
    await setDoc(poemRef, { likes: 0 }); // initializes if not present
  }

  if (userLikeDoc.exists()) {
    // Remove like
    await updateDoc(poemRef, { likes: increment(-1) });
    await deleteDoc(userLikeDoc.ref);
    return false;
  } else {
    // Add like
    await updateDoc(poemRef, { likes: increment(1) });
    await setDoc(userLikeRef, {
      userId: auth.currentUser?.uid,
      poemId,
      timestamp: new Date()
    });
    return true;
  }
};

// Get like count
export const getTotalLikes = async (poemId: string) => {
  const poemRef = doc(db, POEMS_COLLECTION, poemId);
  const poemDoc = await getDoc(poemRef);
  return poemDoc.data()?.likes || 0;
};