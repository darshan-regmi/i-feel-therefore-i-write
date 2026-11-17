import { ImageResponse } from "next/og";
import { getPoem } from "@/lib/poems";

export const runtime = "edge";
export const revalidate = 300;

export const alt = "A poem by Darshan Regmi — i feel, therefore i write";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f6f1e7";
const INK = "#2a2520";
const FADED = "#6f675b";

export default async function PoemOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const poem = await getPoem(slug);

  const title = (poem?.title ?? "i feel, therefore i write").toLowerCase();
  const excerptLines =
    poem?.content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 3)
      .map((line) => line.substring(0, 64)) ?? ["poetry by darshan regmi"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: "68px 80px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.06em",
            color: FADED,
            textTransform: "lowercase",
          }}
        >
          <span>i feel, therefore i write</span>
          <span>poem</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 46 ? 62 : 76,
              fontStyle: "italic",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              textTransform: "lowercase",
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", width: 100, height: 1, background: INK }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 25,
              lineHeight: 1.5,
              color: FADED,
            }}
          >
            {excerptLines.map((line, index) => (
              <span key={index}>{line}</span>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: FADED,
            textTransform: "lowercase",
          }}
        >
          — darshan regmi
        </div>
      </div>
    ),
    size
  );
}
