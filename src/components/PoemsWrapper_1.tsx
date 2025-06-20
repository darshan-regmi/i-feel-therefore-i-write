"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

const PoemsClient = dynamic(() => import("@/components/PoemClient_1"), {
  ssr: false,
});

type Poem = {
  id: string;
  title: string;
  content: string;
};

export default function PoemsWrapper({ poems }: { poems: Poem[] }) {

  useEffect(() => {
    const saved = sessionStorage.getItem("poems-scroll");
    if (saved) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: "auto" });
      }, 0);
      sessionStorage.removeItem("poems-scroll"); // 🧼 Clean up
    }
  }, []);

  return <PoemsClient poems={poems} />;
}
