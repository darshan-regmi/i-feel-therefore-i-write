"use client";

import { useState, useEffect, useCallback } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { getUserLikeStatus, toggleLike, getTotalLikes } from "@/lib/likes";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";

interface LikeButtonProps {
  poemId: string;
}

export default function LikeButton({ poemId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // 🔁 Ensure user is signed in (anon or not)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setCurrentUserUid(user.uid);
        setAuthReady(true);
      } else {
        try {
          const result = await signInAnonymously(auth);
          setCurrentUserUid(result.user.uid);
          setAuthReady(true);
        } catch (error) {
          console.error("❌ Anonymous sign-in failed", error);
          setAuthReady(true); // Still set ready to avoid infinite loading
        }
      }
    });

    return unsubscribe;
  }, []);

  // 🔄 Fetch like status and count
  const fetchLikeData = useCallback(async () => {
    if (!authReady || !currentUserUid || !poemId) return;

    setLoading(true);
    try {
      // Fetch both in parallel for better performance
      const [likes, status] = await Promise.all([
        getTotalLikes(poemId),
        getUserLikeStatus(poemId, currentUserUid),
      ]);

      setTotalLikes(likes);
      setIsLiked(status);
    } catch (err) {
      console.error("Error fetching like data:", err);
      // Set defaults on error
      setTotalLikes(0);
      setIsLiked(false);
    } finally {
      setLoading(false);
    }
  }, [poemId, currentUserUid, authReady]);

  // Initialize like data when auth is ready
  useEffect(() => {
    fetchLikeData();
  }, [fetchLikeData]);

  // ❤️ Toggle like
  const handleLike = async () => {
    if (isAnimating || !currentUserUid || !authReady) return;

    setIsAnimating(true);

    // Store current state for potential rollback
    const previousLiked = isLiked;
    const previousLikes = totalLikes;

    // Optimistic update
    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? totalLikes + 1 : totalLikes - 1;

    setIsLiked(newLikedState);
    setTotalLikes(newLikesCount);

    try {
      // Perform the toggle operation
      const updatedStatus = await toggleLike(poemId, currentUserUid);
      
      // Fetch the actual count from server to ensure consistency
      const actualCount = await getTotalLikes(poemId);
      
      // Update with server truth
      setIsLiked(updatedStatus);
      setTotalLikes(actualCount);
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Rollback on error
      setIsLiked(previousLiked);
      setTotalLikes(previousLikes);
      
      // Optional: Show error notification to user
      alert("Failed to update like. Please try again.");
    } finally {
      setIsAnimating(false);
    }
  };

  // Show loading state
  if (loading || !authReady) {
    return (
      <div className="flex items-center gap-2 opacity-50 select-none">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <FaRegHeart className="w-4 h-4 text-gray-400 animate-pulse" />
        </div>
        <span className="text-sm font-medium text-gray-400">—</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={isAnimating || !currentUserUid}
      className={`group flex items-center gap-2 transition-all duration-200 ${
        isAnimating ? "opacity-70 cursor-wait" : "hover:scale-105 active:scale-95"
      } disabled:cursor-not-allowed`}
      aria-pressed={isLiked}
      aria-label={isLiked ? `Unlike poem (${totalLikes} likes)` : `Like poem (${totalLikes} likes)`}
    >
      <div
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
          isLiked
            ? "bg-red-50 border-2 border-red-200"
            : "bg-gray-50 border-2 border-gray-200 group-hover:border-red-200 group-hover:bg-red-50"
        }`}
      >
        <AnimatePresence mode="wait">
          {isLiked ? (
            <motion.div
              key="liked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <FaHeart className="w-4 h-4 text-red-500" />
            </motion.div>
          ) : (
            <motion.div
              key="not-liked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <FaRegHeart className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors duration-200" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation on like */}
        {isLiked && isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
            key={`pulse-${Date.now()}`}
          />
        )}
      </div>

      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          isLiked ? "text-red-500" : "text-gray-600 group-hover:text-red-500"
        }`}
      >
        {totalLikes}
      </span>
    </button>
  );
}