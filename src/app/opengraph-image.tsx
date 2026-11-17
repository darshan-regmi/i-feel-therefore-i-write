import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "i feel, therefore i write — poetry by Darshan Regmi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f6f1e7";
const INK = "#2a2520";
const FADED = "#6f675b";

export default function OpengraphImage() {
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
            textTransform: "lowercase",
            color: FADED,
          }}
        >
          <span>i feel, therefore i write</span>
          <span>poetry</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 86,
              fontStyle: "italic",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              textTransform: "lowercase",
            }}
          >
            <span>i feel,</span>
            <span>therefore i write</span>
          </div>
          <div style={{ display: "flex", width: 120, height: 1, background: INK }} />
          <div style={{ fontSize: 30, textTransform: "lowercase" }}>
            poems by darshan regmi
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
          for anyone who’s ever felt too much, or not enough.
        </div>
      </div>
    ),
    size
  );
}
