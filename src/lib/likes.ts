import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
} from 'firebase/firestore';

const LIKES_COLLECTION = 'likes';
const POEMS_COLLECTION = 'poems';

let isAuthResolved = false;

/**
 * Ensures the user is signed in anonymously before making Firestore calls.
 */
export const ensureAuth = async (): Promise<string> => {
  if (isAuthResolved && auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.uid) {
        isAuthResolved = true;
        resolve(user.uid);
        unsubscribe();
      } else {
        try {
          const result = await signInAnonymously(auth);
          isAuthResolved = true;
          resolve(result.user.uid);
          unsubscribe();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

/**
 * Checks if the specified (or current) user has liked a specific poem.
 */
export const getUserLikeStatus = async (
  poemId: string,
  userId?: string
): Promise<boolean> => {
  try {
    const uid = userId ?? (await ensureAuth());
    const userLikeRef = doc(db, LIKES_COLLECTION, `${uid}-${poemId}`);
    const userLikeDoc = await getDoc(userLikeRef);
    return userLikeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

/**
 * Toggles a like on a poem for the specified (or current) user.
 * Returns `true` if liked, `false` if unliked.
 */
export const toggleLike = async (
  poemId: string,
  userId?: string
): Promise<boolean> => {
  try {
    const uid = userId ?? (await ensureAuth());
    const userLikeRef = doc(db, LIKES_COLLECTION, `${uid}-${poemId}`);
    const poemRef = doc(db, POEMS_COLLECTION, poemId);

    const [userLikeDoc, poemDoc] = await Promise.all([
      getDoc(userLikeRef),
      getDoc(poemRef),
    ]);

    if (!poemDoc.exists()) {
      await setDoc(poemRef, { likes: 0 }, { merge: true });
    }

    if (userLikeDoc.exists()) {
      // Remove like
      await Promise.all([
        updateDoc(poemRef, { likes: increment(-1) }),
        deleteDoc(userLikeRef),
      ]);
      return false;
    } else {
      // Add like
      await Promise.all([
        updateDoc(poemRef, { likes: increment(1) }),
        setDoc(userLikeRef, {
          userId: uid,
          poemId,
          timestamp: new Date(),
        }),
      ]);
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
};

/**
 * Fetches the total number of likes for a given poem.
 */
export const getTotalLikes = async (poemId: string): Promise<number> => {
  try {
    const poemRef = doc(db, POEMS_COLLECTION, poemId);
    const poemDoc = await getDoc(poemRef);
    return poemDoc.data()?.likes || 0;
  } catch (error) {
    console.error('Error fetching total likes:', error);
    return 0;
  }
};