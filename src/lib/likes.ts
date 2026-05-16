import { auth, db } from './firebase';
import { signInAnonymously, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  increment,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

const LIKES_COLLECTION = 'likes';
const POEMS_COLLECTION = 'poems';

// Types
export interface LikeDocument {
  userId: string;
  poemId: string;
  timestamp: Date;
}

export interface PoemDocument {
  likes: number;
  title?: string;
  createdAt?: string;
  lastSynced?: string;
}

// Auth state management
let isAuthResolved = false;
let cachedUid: string | null = null;
let authPromise: Promise<string> | null = null;

/**
 * Ensures the user is signed in anonymously and caches UID.
 */
export const ensureAuth = async (): Promise<string> => {
  // Return cached UID if available
  if (isAuthResolved && cachedUid && auth.currentUser?.uid) {
    return cachedUid;
  }

  // Return existing promise if auth is in progress
  if (authPromise) {
    return authPromise;
  }

  authPromise = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error('Authentication timeout after 10 seconds'));
    }, 10000);

    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      try {
        clearTimeout(timeout);

        if (user?.uid) {
          isAuthResolved = true;
          cachedUid = user.uid;
          console.log('✅ User authenticated:', user.uid);
          resolve(user.uid);
          unsubscribe();
        } else {
          console.log('🔐 Signing in anonymously...');
          const result = await signInAnonymously(auth);
          isAuthResolved = true;
          cachedUid = result.user.uid;
          console.log('✅ Anonymous sign-in successful:', cachedUid);
          resolve(cachedUid);
          unsubscribe();
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('❌ Authentication error:', error);
        reject(error);
        unsubscribe();
      } finally {
        authPromise = null;
      }
    });
  });

  return authPromise;
};

/**
 * Gets the cached UID or resolves authentication once.
 */
export const getUid = async (): Promise<string> => {
  if (cachedUid && auth.currentUser?.uid === cachedUid) {
    return cachedUid;
  }
  return await ensureAuth();
};

/**
 * Resets auth cache (useful for testing or after sign out).
 */
export const resetAuthCache = (): void => {
  isAuthResolved = false;
  cachedUid = null;
  authPromise = null;
  console.log('🔄 Auth cache reset');
};

/**
 * Checks if the user has liked a poem.
 */
export const getUserLikeStatus = async (
  poemId: string,
  userId?: string
): Promise<boolean> => {
  try {
    if (!poemId || typeof poemId !== 'string') {
      console.error('❌ Invalid poemId:', poemId);
      return false;
    }

    const uid = userId ?? (await getUid());
    const likeId = `${poemId}_${uid}`;
    const userLikeRef = doc(db, LIKES_COLLECTION, likeId);
    
    console.log(`🔍 Checking like status: ${likeId}`);
    const userLikeDoc = await getDoc(userLikeRef);
    const isLiked = userLikeDoc.exists();
    
    console.log(`${isLiked ? '❤️' : '🤍'} Poem ${poemId} liked: ${isLiked}`);
    return isLiked;
  } catch (error) {
    console.error('❌ Error checking like status:', error);
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
  const startTime = Date.now();

  try {
    if (!poemId || typeof poemId !== 'string') {
      throw new Error('Invalid poemId provided');
    }

    const uid = userId ?? (await getUid());
    const likeId = `${poemId}_${uid}`;
    const userLikeRef = doc(db, LIKES_COLLECTION, likeId);
    const poemRef = doc(db, POEMS_COLLECTION, poemId);

    // Check current like status
    const userLikeDoc = await getDoc(userLikeRef);
    const batch = writeBatch(db);

    if (userLikeDoc.exists()) {
      // Unlike
      console.log(`💔 Unliking poem: ${poemId}`);
      batch.update(poemRef, { likes: increment(-1) });
      batch.delete(userLikeRef);
      await batch.commit();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Unliked poem ${poemId} (${duration}ms)`);
      return false;
    } else {
      // Like. The poem doc is guaranteed to exist by the /api/sync cron;
      // we no longer lazy-create here because the create path is correctly
      // blocked by firestore.rules (no client should be inventing poems).
      console.log(`❤️ Liking poem: ${poemId}`);

      batch.update(poemRef, { likes: increment(1) });
      batch.set(userLikeRef, {
        userId: uid,
        poemId,
        timestamp: new Date(),
      } as LikeDocument);

      await batch.commit();

      const duration = Date.now() - startTime;
      console.log(`✅ Liked poem ${poemId} (${duration}ms)`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to toggle like: ${errorMessage}`);
  }
};

/**
 * Gets the total number of likes on a poem.
 */
export const getTotalLikes = async (poemId: string): Promise<number> => {
  try {
    if (!poemId || typeof poemId !== 'string') {
      console.error('❌ Invalid poemId:', poemId);
      return 0;
    }

    const poemRef = doc(db, POEMS_COLLECTION, poemId);
    const poemDoc = await getDoc(poemRef);
    
    if (!poemDoc.exists()) {
      console.log(`📝 Poem document not found for ${poemId}, returning 0 likes`);
      return 0;
    }

    const likes = poemDoc.data()?.likes || 0;
    console.log(`👍 Poem ${poemId} has ${likes} likes`);
    return likes;
  } catch (error) {
    console.error('❌ Error fetching total likes:', error);
    return 0;
  }
};

/**
 * Gets all liked poem IDs for a user.
 */
export const getUserLikedPoems = async (userId?: string): Promise<string[]> => {
  try {
    const uid = userId ?? (await getUid());
    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(likesRef, where('userId', '==', uid));
    
    console.log(`📋 Fetching liked poems for user: ${uid}`);
    const snapshot = await getDocs(q);
    
    const poemIds = snapshot.docs.map(doc => doc.data().poemId as string);
    console.log(`✅ Found ${poemIds.length} liked poems`);
    
    return poemIds;
  } catch (error) {
    console.error('❌ Error fetching user liked poems:', error);
    return [];
  }
};

/**
 * Batch check like status for multiple poems (optimization).
 */
export const batchGetLikeStatus = async (
  poemIds: string[],
  userId?: string
): Promise<Map<string, boolean>> => {
  const results = new Map<string, boolean>();

  try {
    if (!poemIds || poemIds.length === 0) {
      return results;
    }

    const uid = userId ?? (await getUid());
    console.log(`🔍 Batch checking ${poemIds.length} poems for user ${uid}`);

    // Firestore has a limit of 10 for 'in' queries, so we need to batch
    const batchSize = 10;
    for (let i = 0; i < poemIds.length; i += batchSize) {
      const batchIds = poemIds.slice(i, i + batchSize);
      const likeIds = batchIds.map(id => `${id}_${uid}`);
      
      const promises = likeIds.map(likeId => 
        getDoc(doc(db, LIKES_COLLECTION, likeId))
      );
      
      const docs = await Promise.all(promises);
      
      batchIds.forEach((poemId, index) => {
        results.set(poemId, docs[index].exists());
      });
    }

    console.log(`✅ Batch check complete: ${results.size} results`);
    return results;
  } catch (error) {
    console.error('❌ Error in batch like status check:', error);
    return results;
  }
};