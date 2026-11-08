import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

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
  return (
    <>
      {/* The root layout paints the body white; this room is not white. */}
      <style>{`body:has([data-confessional]){background:#0b0a0a;overscroll-behavior:none}`}</style>
      <div data-confessional className={`${instrumentSerif.variable} bg-void text-bone`}>
        {children}
      </div>
    </>
  );
}
