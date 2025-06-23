import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  doc,
  getDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';

const LIKES_COLLECTION = 'likes';
const POEMS_COLLECTION = 'poems';

let isAuthResolved = false;
let cachedUid: string | null = null;

/**
 * Ensures the user is signed in anonymously and caches UID.
 */
export const ensureAuth = async (): Promise<string> => {
  if (isAuthResolved && auth.currentUser?.uid) {
    cachedUid = auth.currentUser.uid;
    return cachedUid;
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.uid) {
        isAuthResolved = true;
        cachedUid = user.uid;
        resolve(user.uid);
        unsubscribe();
      } else {
        try {
          const result = await signInAnonymously(auth);
          isAuthResolved = true;
          cachedUid = result.user.uid;
          resolve(cachedUid);
          unsubscribe();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

/**
 * Gets the cached UID or resolves authentication once.
 */
export const getUid = async (): Promise<string> => {
  if (cachedUid) return cachedUid;
  return await ensureAuth();
};

/**
 * Checks if the user has liked a poem.
 */
export const getUserLikeStatus = async (
  poemId: string,
  userId?: string
): Promise<boolean> => {
  try {
    const uid = userId ?? (await getUid());
    const userLikeRef = doc(db, LIKES_COLLECTION, `${poemId}_${uid}`);
    const userLikeDoc = await getDoc(userLikeRef);
    return userLikeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

/**
 * Toggles a like on a poem. Returns true if liked, false if unliked.
 */
export const toggleLike = async (
  poemId: string,
  userId?: string
): Promise<boolean> => {
  try {
    const uid = userId ?? (await getUid());
    const userLikeRef = doc(db, LIKES_COLLECTION, `${poemId}_${uid}`);
    const poemRef = doc(db, POEMS_COLLECTION, poemId);
    const userLikeDoc = await getDoc(userLikeRef);
    const batch = writeBatch(db);

    if (userLikeDoc.exists()) {
      // Unlike
      batch.update(poemRef, { likes: increment(-1) });
      batch.delete(userLikeRef);
      await batch.commit();
      return false;
    } else {
      // Like
      batch.update(poemRef, { likes: increment(1) }); // Auto-creates if not exists
      batch.set(userLikeRef, {
        userId: uid,
        poemId,
        timestamp: new Date(),
      });
      await batch.commit();
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
};

/**
 * Gets the total number of likes on a poem.
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