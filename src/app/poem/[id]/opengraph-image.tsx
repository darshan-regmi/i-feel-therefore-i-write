import { ImageResponse } from "next/og";
import { getPoemById } from "@/lib/notion";

export const runtime = "edge";
export const revalidate = 3600;

export const alt = "A poem by Darshan Regmi — i feel, therefore i write";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PoemOgImage({
  params,
}: {
  params: { id: string };
}) {
  const poem = await getPoemById(params.id);

  const title = poem?.title ?? "i feel, therefore i write";
  const excerptLines = poem?.content
    ?.split("\n")
    .filter((l) => l.trim().length > 0)
    .slice(0, 3)
    .map((l) => l.trim().substring(0, 90)) ?? ["Poetry by Darshan Regmi"];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
        padding: "72px 80px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#111827",
        position: "relative",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 22,
          color: "#6b7280",
          letterSpacing: 1,
          textTransform: "lowercase",
        }}
      >
        <div
          style={{
            width: 48,
            height: 1,
            background: "linear-gradient(to right, transparent, #9ca3af)",
          }}
        />
        <span style={{ fontStyle: "italic" }}>i feel, therefore i write</span>
        <div
          style={{
            width: 48,
            height: 1,
            background: "linear-gradient(to left, transparent, #9ca3af)",
          }}
        />
      </div>

      {/* Title + excerpt */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            fontSize: title.length > 40 ? 64 : 84,
            lineHeight: 1.05,
            letterSpacing: -1,
            fontWeight: 400,
            color: "#0f172a",
            display: "flex",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 28,
            lineHeight: 1.5,
            color: "#4b5563",
            fontStyle: "italic",
            maxWidth: 1000,
            gap: 4,
          }}
        >
          {excerptLines.map((line, i) => (
            <div key={i} style={{ display: "flex" }}>
              {i === 0 ? `\u201C${line}` : line}
              {i === excerptLines.length - 1 ? `\u201D` : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Byline */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 24,
          color: "#6b7280",
        }}
      >
        <span style={{ fontSize: 18, letterSpacing: 1 }}>
          poetry.darshanregmi.com.np
        </span>
        <span style={{ fontStyle: "italic" }}>— Darshan Regmi</span>
      </div>
    </div>,
    { ...size },
  );
}
