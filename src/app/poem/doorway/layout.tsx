import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

const TITLE = "Doorway";
const DESCRIPTION =
  "I stand before a doorway, its frame thin as a whisper, casting shadows that stretch like questions across the floor. — a poem by Darshan Regmi.";

/** page.tsx is a client component, so its metadata lives here instead. */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/poem/doorway` },
  keywords: [TITLE, "poetry", "poem", "Darshan Regmi", "i feel therefore i write"],
  openGraph: {
    title: `${TITLE} | i feel, therefore i write`,
    description: DESCRIPTION,
    url: `${SITE_URL}/poem/doorway`,
    siteName: "i feel, therefore i write",
    type: "article",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | i feel, therefore i write`,
    description: DESCRIPTION,
    site: "@Regmi6Darshan",
    creator: "@Regmi6Darshan",
    images: [`${SITE_URL}/default-og-image.png`],
  },
};

const CREATIVE_WORK_STATUS = "https://schema.org/PublishedWorkStatus";

export default function DoorwayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/poem/doorway#poem`,
    name: TITLE,
    url: `${SITE_URL}/poem/doorway`,
    inLanguage: "en",
    genre: "Poetry",
    creativeWorkStatus: CREATIVE_WORK_STATUS,
    isAccessibleForFree: true,
    author: { "@id": `${SITE_URL}/#person` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}