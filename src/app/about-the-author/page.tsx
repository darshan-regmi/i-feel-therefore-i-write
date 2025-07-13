import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Author",
  description:
    "Learn more about Darshan Regmi, the poet behind i feel, therefore i write. Discover his journey, inspirations, and current projects.",
  openGraph: {
    title: "About the Author",
    description:
      "Learn more about Darshan Regmi, the poet behind i feel, therefore i write. Discover his journey, inspirations, and current projects.",
    url: "https://poetry.darshanregmi.com.np/about-the-author",
    images: [
      {
        url: "https://poetry.darshanregmi.com.np/author.jpg",
        width: 800,
        height: 1000,
        alt: "Darshan Regmi - Poetry Author",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About the Author | i feel, therefore i write",
    description:
      "Learn more about Darshan Regmi, the poet behind i feel, therefore i write.",
    images: ["https://poetry.darshanregmi.com.np/author.jpg"],
  },
};

const AboutTheAuthor: React.FC = () => {
  return (
    <div className="bg-white flex flex-col justify-between min-h-screen">
      <main className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
        <Link
          href="/"
          aria-label="Back to home"
          className="self-start mb-6 text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← back to home
        </Link>

        <section className="w-full max-w-5xl mx-auto py-8 sm:py-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            About the Author
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            {/* Responsive Image */}
            <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-[360px] md:h-[420px] relative rounded-full md:rounded-5xl overflow-hidden border-4 border-gray-300 shadow-lg">
              <Image
                src="/author.jpg"
                alt="Darshan Regmi"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Text */}
            <div className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4 max-w-xl">
              <p>
                Hey, I’m <strong>Darshan Regmi</strong>. I write poems to feel,
                to heal, and to remember. My words are born from quiet nights,
                soft love, and the kind of memories that linger.
              </p>

              <p>
                I’m currently working on my first poetry book,{" "}
                <em>“Our Story”</em> — a tender journey through love, loss, and
                the slow, beautiful act of becoming whole again.
              </p>

              <p>
                Find fragments of my life and poetry on{" "}
                <a
                  href="https://instagram.com/_darshan_regmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @_darshan_regmi
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default AboutTheAuthor;
