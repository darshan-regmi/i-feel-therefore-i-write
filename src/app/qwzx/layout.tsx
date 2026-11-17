import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "qwzx",
  description: "",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ConfessionalLayout({ children }: { children: ReactNode }) {
  return <div data-confessional>{children}</div>;
}
