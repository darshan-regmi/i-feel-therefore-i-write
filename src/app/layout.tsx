import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://poetry.darshanregmi.com.np"),
  title: {
    default: "i feel, therefore i write",
    template: "%s | i feel, therefore i write",
  },
  description:
    "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough.",
  keywords: [
    "poetry",
    "poems",
    "creative writing",
    "emotions",
    "feelings",
    "literature",
    "Darshan Regmi",
    "i feel therefore i write",
    "poet",
  ],
  authors: [{ name: "Darshan Regmi", url: "https://darshanregmi.com.np" }],
  creator: "Darshan Regmi",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.ico",
        color: "#000000",
      },
    ],
  },
  openGraph: {
    title: "i feel, therefore i write",
    description:
      "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough.",
    url: "https://poetry.darshanregmi.com.np",
    siteName: "i feel, therefore i write",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/default-og-image.png",
        width: 1200,
        height: 630,
        alt: "i feel, therefore i write",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "i feel, therefore i write",
    description:
      "A personal collection of poems by Darshan Regmi. For anyone who's ever felt too much, or not enough.",
    site: "@Regmi6Darshan",
    creator: "@Regmi6Darshan",
    images: ["https://poetry.darshanregmi.com.np/default-og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
