"use client";

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { getUserLikeStatus, toggleLike, getTotalLikes } from '@/lib/likes';
import { motion, AnimatePresence } from 'framer-motion';

interface LikeButtonProps {
  poemId: string;
}

export default function LikeButton({ poemId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
  const initialize = async () => {
    try {
      const status = await getUserLikeStatus(poemId);
      const likes = await getTotalLikes(poemId);
      setIsLiked(status);
      setTotalLikes(likes);
    } catch (err) {
      console.error("Error initializing like state:", err);
    }
  };

  initialize();
}, [poemId]);

  const handleLike = async () => {
    setIsAnimating(true);
    try {
      const newStatus = await toggleLike(poemId);
      setIsLiked(newStatus);
      setTotalLikes(newStatus ? totalLikes + 1 : totalLikes - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  const [loading, setLoading] = useState(true);

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

  if (loading) return null; // or a small spinner

  return (
    <button
      onClick={handleLike}
      disabled={isAnimating}
      className={`flex items-center gap-2 transition duration-200 ${
        isAnimating ? '': 'hover:scale-105'
      }`}
    >
      <AnimatePresence mode="wait">
        {isLiked ? (
          <motion.div
            key="liked"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.2 }}
            exit={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <FaHeart className="w-5 h-5 text-red-500" />
          </motion.div>
        ) : (
          <motion.div
            key="not-liked"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <FaRegHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
        {totalLikes}
      </span>
    </button>
  );
}