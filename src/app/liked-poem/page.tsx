"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import PoemsWrapper from "@/components/PoemsWrapper_1";

export default function LikedPoemPage() {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) {
        router.push("/login");
      } else {
        const fetchPoems = async () => {
          try {
            const res = await fetch(
              "/api/poem"
            );
            const data = await res.json();
            setPoems(data);
          } catch (err) {
            console.error("Failed to fetch poems:", err);
          } finally {
            setLoading(false);
          }
        };

        fetchPoems(); // ✅ safe async call inside sync listener
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-gray-600">
        <p className="italic">retrieving your saved verses...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-8">
      <div className="flex justify-between items-center w-full mb-8">
        <Link
          href="/poem"
          aria-label="Go back poems"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-200"
        >
          ← back to poems
        </Link>
      </div>
      <h1 className="text-4xl font-serif text-center mb-2">liked poems</h1>
      <p className="text-gray-600 text-center max-w-xl mb-8">
        bits of emotion you&#39;ve carried, now kept in your heart.
      </p>

      <PoemsWrapper poems={poems} />
    </main>
  );
}
