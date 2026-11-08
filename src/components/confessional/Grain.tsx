"use client";

// A tiled fractal-noise sheet. Rasterised once by the browser and never
// animated: mix-blend-mode is intentionally omitted because blending a
// full-screen fixed layer against a moving scene costs a full-screen
// recomposite every frame.
const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="180" height="180" filter="url(#n)" opacity="0.55"/></svg>`
)}")`;

export default function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        backgroundImage: NOISE,
        backgroundSize: "180px 180px",
        opacity: 0.06,
      }}
    />
  );
}
