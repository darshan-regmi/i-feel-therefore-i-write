"use client";

import { useState, useEffect } from "react";
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

  // 🔁 Ensure user is signed in (anon or not)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setCurrentUserUid(user.uid);
      } else {
        try {
          const result = await signInAnonymously(auth);
          setCurrentUserUid(result.user.uid);
        } catch (error) {
          console.error("❌ Anonymous sign-in failed", error);
        }
      }
    });

    return unsubscribe;
  }, []);

  // 🔄 Re-fetch like status + count when user or poemId changes
  useEffect(() => {
    const initialize = async () => {
      setLoading(false);
      try {
        const likes = await getTotalLikes(poemId);

        if (currentUserUid) {
          const status = await getUserLikeStatus(poemId, currentUserUid);
          setIsLiked(status);
        } else {
          setIsLiked(false);
        }

        setTotalLikes(likes);
      } catch (err) {
        console.error("Error initializing like state:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [poemId, currentUserUid]);

  // ❤️ Toggle like
  const handleLike = async () => {
    if (isAnimating || !currentUserUid) return;

    setIsAnimating(true);

    const optimisticLiked = !isLiked;
    const optimisticLikes = optimisticLiked ? totalLikes + 1 : totalLikes - 1;

    setIsLiked(optimisticLiked);
    setTotalLikes(optimisticLikes);

    try {
      const newStatus = await toggleLike(poemId, currentUserUid);
      setIsLiked(newStatus);
      setTotalLikes(await getTotalLikes(poemId));
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(isLiked); // revert
      setTotalLikes(totalLikes);
    } finally {
      setIsAnimating(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 opacity-50 cursor-not-allowed select-none"
        aria-label="Loading likes"
      >
        <FaRegHeart className="w-5 h-5 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">—</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={isAnimating || !currentUserUid}
      className={`flex items-center gap-2 transition duration-200 ${
        isAnimating ? "opacity-70 cursor-wait" : "hover:scale-105"
      }`}
      aria-pressed={isLiked}
      aria-label={isLiked ? "Unlike poem" : "Like poem"}
    >
      <AnimatePresence mode="wait">
        {isLiked ? (
          <motion.div
            key="liked"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.2 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <FaHeart className="w-5 h-5 text-red-500 cursor-pointer group" />
          </motion.div>
        ) : (
          <motion.div
            key="not-liked"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <FaRegHeart className="w-5 h-5 text-gray-600 hover:text-red-500 cursor-pointer group" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className={`text-sm ${isLiked ? "text-red-500" : "text-gray-600"}`}>
        {totalLikes}
      </span>
    </button>
  );
}