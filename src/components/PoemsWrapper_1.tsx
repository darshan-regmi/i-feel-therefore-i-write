"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const PoemsClient = dynamic(() => import("@/components/PoemClient_1"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl space-y-6 px-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 animate-pulse"
          >
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="h-4 w-4/6 bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div className="h-6 w-6 bg-gray-200 rounded-full" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});

type Poem = {
  id: string;
  title: string;
  content: string;
};

export default function PoemsWrapper({ poems }: { poems: Poem[] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Restore scroll position
  useEffect(() => {
    if (!isClient) return;

    const restoreScroll = () => {
      try {
        const savedScroll = sessionStorage.getItem("poems-scroll");
        if (savedScroll) {
          const scrollPosition = parseInt(savedScroll, 10);
          
          // Validate scroll position
          if (!isNaN(scrollPosition) && scrollPosition >= 0) {
            // Use requestAnimationFrame for smoother scroll restoration
            requestAnimationFrame(() => {
              window.scrollTo({
                top: scrollPosition,
                behavior: "instant",
              });
            });
          }
          
          // Clean up
          sessionStorage.removeItem("poems-scroll");
        }
      } catch (error) {
        console.error("Error restoring scroll position:", error);
        // Clean up on error
        sessionStorage.removeItem("poems-scroll");
      }
    };

    // Wait for content to load before restoring scroll
    const timer = setTimeout(restoreScroll, 100);

    return () => clearTimeout(timer);
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return <PoemsClient poems={poems} />;
}