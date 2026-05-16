"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { getUserLikeStatus, toggleLike, getTotalLikes } from "@/lib/likes";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { useLikedPoems } from "./LikedPoemsProvider";

interface LikeButtonProps {
  poemId: string;
  initialLikes?: number;
}

export default function LikeButton({ poemId, initialLikes }: LikeButtonProps) {
  const ctx = useLikedPoems();

  const [totalLikes, setTotalLikes] = useState<number>(initialLikes ?? 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(
    ctx?.uid ?? null,
  );
  const [standaloneAuthReady, setStandaloneAuthReady] = useState(false);

  // If a provider is present we trust its uid/ready state; otherwise we run our
  // own auth subscription (e.g. on the detail page that doesn't wrap a provider).
  const usingContext = ctx !== null;
  const authReady = usingContext ? ctx!.ready : standaloneAuthReady;

  useEffect(() => {
    if (usingContext) {
      setCurrentUserUid(ctx!.uid);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setCurrentUserUid(user.uid);
        setStandaloneAuthReady(true);
        return;
      }
      try {
        const result = await signInAnonymously(auth);
        setCurrentUserUid(result.user.uid);
      } catch (error) {
        console.error("Anonymous sign-in failed", error);
      } finally {
        setStandaloneAuthReady(true);
      }
    });
    return unsubscribe;
  }, [usingContext, ctx]);

  // Initial liked status:
  //  - From context if available (one batched query covers all poems).
  //  - Otherwise fetch once after auth resolves.
  const fetchedUserStatusRef = useRef(false);
  useEffect(() => {
    if (usingContext && ctx!.ready) {
      setIsLiked(ctx!.isLiked(poemId));
      fetchedUserStatusRef.current = true;
      return;
    }
    if (usingContext) return;
    if (!authReady || !currentUserUid || fetchedUserStatusRef.current) return;
    fetchedUserStatusRef.current = true;
    getUserLikeStatus(poemId, currentUserUid)
      .then(setIsLiked)
      .catch((err) => console.error("Failed to fetch like status:", err));
  }, [usingContext, ctx, authReady, currentUserUid, poemId]);

  // Like count: skip the fetch when the server already gave us an initial value.
  const fetchedCountRef = useRef(initialLikes !== undefined);
  useEffect(() => {
    if (fetchedCountRef.current) return;
    fetchedCountRef.current = true;
    getTotalLikes(poemId)
      .then(setTotalLikes)
      .catch((err) => console.error("Failed to fetch like count:", err));
  }, [poemId]);

  const handleLike = useCallback(async () => {
    if (isAnimating || !currentUserUid || !authReady) return;
    setIsAnimating(true);

    const previousLiked = isLiked;
    const previousLikes = totalLikes;
    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? totalLikes + 1 : totalLikes - 1;

    setIsLiked(newLikedState);
    setTotalLikes(newLikesCount);
    ctx?.markLiked(poemId, newLikedState);

    try {
      const updatedStatus = await toggleLike(poemId, currentUserUid);
      const actualCount = await getTotalLikes(poemId);
      setIsLiked(updatedStatus);
      setTotalLikes(actualCount);
      ctx?.markLiked(poemId, updatedStatus);
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(previousLiked);
      setTotalLikes(previousLikes);
      ctx?.markLiked(poemId, previousLiked);
      alert("Failed to update like. Please try again.");
    } finally {
      setIsAnimating(false);
    }
  }, [
    isAnimating,
    currentUserUid,
    authReady,
    isLiked,
    totalLikes,
    ctx,
    poemId,
  ]);

  // Only render the spinner while we genuinely have nothing to show. With an
  // initialLikes prop we render the count immediately and only the heart fill
  // catches up once auth/context is ready.
  const showSpinner = !authReady && initialLikes === undefined;

  if (showSpinner) {
    return (
      <div className="flex items-center gap-2 opacity-50 select-none">
        <FaRegHeart className="w-4 h-4 text-gray-400 animate-pulse" />
        <span className="text-sm font-medium text-gray-400">—</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={isAnimating || !currentUserUid}
      className={`group flex items-center gap-2 transition-all duration-200 ${
        isAnimating
          ? "opacity-70 cursor-wait"
          : "hover:scale-105 active:scale-95"
      } disabled:cursor-not-allowed`}
      aria-pressed={isLiked}
      aria-label={
        isLiked
          ? `Unlike poem (${totalLikes} likes)`
          : `Like poem (${totalLikes} likes)`
      }
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

      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          isLiked ? "text-red-500" : "text-gray-600"
        }`}
      >
        {totalLikes}
      </span>
    </button>
  );
}
