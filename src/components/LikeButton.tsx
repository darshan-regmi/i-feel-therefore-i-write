"use client";

import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { getUserLikeStatus, toggleLike, getTotalLikes } from "@/lib/likes";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
  poemId: string;
}

export default function LikeButton({ poemId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial like status and total likes on mount or when poemId changes
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const status = await getUserLikeStatus(poemId);
        const likes = await getTotalLikes(poemId);
        setIsLiked(status);
        setTotalLikes(likes);
      } catch (err) {
        console.error("Error initializing like state:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [poemId]);

  // Optimistic UI update on like toggle
  const handleLike = async () => {
    if (isAnimating) return; // Prevent spamming clicks
    setIsAnimating(true);

    // Optimistic update — immediately reflect the new state in UI
    const optimisticLiked = !isLiked;
    const optimisticLikes = optimisticLiked ? totalLikes + 1 : totalLikes - 1;

    setIsLiked(optimisticLiked);
    setTotalLikes(optimisticLikes);

    try {
      const newStatus = await toggleLike(poemId);

      // Sync with server result (in case of mismatch)
      setIsLiked(newStatus);
      // Optionally re-fetch likes count for absolute accuracy
      // const updatedLikes = await getTotalLikes(poemId);
      // setTotalLikes(updatedLikes);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on failure
      setIsLiked(isLiked);
      setTotalLikes(totalLikes);
    } finally {
      setIsAnimating(false);
    }
  };

  // While loading, show disabled button with placeholder UI (not blank)
  if (loading)
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

  return (
    <button
      onClick={handleLike}
      disabled={isAnimating}
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
            <FaHeart className="w-5 h-5 text-red-500" />
          </motion.div>
        ) : (
          <motion.div
            key="not-liked"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <FaRegHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className={`text-sm ${isLiked ? "text-red-500" : "text-gray-600"}`}>
        {totalLikes}
      </span>
    </button>
  );
}