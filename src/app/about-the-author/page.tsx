import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

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
                Hey, I&#39;m <strong>Darshan Regmi</strong>. I write poems to
                feel, to heal, and to remember. My words come from quiet nights,
                soft love, and memories that never quite leave.
              </p>

              <p>
                I&#39;m working on my first book, <em>“Our Story”</em> — a
                journey through love, loss, and becoming whole again.
              </p>

              <p>
                I share my poetry on{" "}
                <a
                  href="https://instagram.com/wordsbydarshan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @wordsbydarshan
                </a>
                , and glimpses of my life on{" "}
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
