import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the Author",
  description:
    "Learn more about Darshan Regmi, the poet behind i feel, therefore i write. Discover his journey, inspirations, and current projects.",
  alternates: {
    canonical: `${SITE_URL}/about-the-author`,
  },
  openGraph: {
    title: "About the Author",
    description:
      "Learn more about Darshan Regmi, the poet behind i feel, therefore i write. Discover his journey, inspirations, and current projects.",
    url: `${SITE_URL}/about-the-author`,
    images: [
      {
        url: `${SITE_URL}/author.jpg`,
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
    images: [`${SITE_URL}/author.jpg`],
  },
};

/**
 * The root layout emits the Person entity; this marks the page itself as the
 * author's profile and ties it to the site, which is what qualifies it for the
 * profile/breadcrumb treatments.
 */
function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/about-the-author#profilepage`,
    url: `${SITE_URL}/about-the-author`,
    name: "About the Author",
    description:
      "Learn more about Darshan Regmi, the poet behind i feel, therefore i write.",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${SITE_URL}/#person` },
    about: { "@id": `${SITE_URL}/#person` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "About the Author", item: `${SITE_URL}/about-the-author` },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

const AboutTheAuthor: React.FC = () => {
  return (
    <>
      <JsonLd />
      <div className="bg-gradient-to-br from-slate-50 via-white to-gray-50 flex flex-col justify-between min-h-screen">
      <main className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
        <Link
          href="/"
          aria-label="Back to home"
          className="self-start mb-6 text-gray-600 hover:text-gray-900 transition-all duration-300 group flex items-center gap-2"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span className="font-medium">back to home</span>
        </Link>

        <section className="w-full max-w-6xl mx-auto py-8 sm:py-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            About the Author
          </h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-16">
            {/* Enhanced Image with gradient border */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 rounded-full md:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[440px] md:h-[500px] rounded-full md:rounded-3xl overflow-hidden border-4 border-white shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/author.jpg"
                  alt="Darshan Regmi"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Enhanced Text with better typography */}
            <div className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-6 max-w-xl">
              <p className="text-xl sm:text-2xl font-light text-gray-800">
                Hey, I'm <strong className="font-semibold text-gray-900">Darshan Regmi</strong>. I write poems to feel,
                to heal, and to remember. My words are born from quiet nights,
                soft love, and the kind of memories that linger.
              </p>

              <p className="border-l-4 border-gray-300 pl-6 italic text-gray-600">
                I'm finishing my poetry book, <em className="text-gray-800 not-italic font-medium">"If Only You Knew"</em>, which
                will soon be published — a tender journey through love, loss,
                and the slow, beautiful act of becoming whole again.
              </p>

              <div className="pt-4">
                <p className="mb-3 text-gray-600">Find me here:</p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <a
                    href="https://instagram.com/bydarshanregmi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="font-medium">Poetry</span>
                  </a>
                  <a
                    href="https://instagram.com/_darshan_regmi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="font-medium">Personal</span>
                  </a>
            </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
    </>
  );
};

export default AboutTheAuthor;