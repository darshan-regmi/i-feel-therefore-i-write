// Twitter cards reuse the themed OG image. The route config must be declared
// literally here; Next's static analyser cannot trace re-exported constants.
export const runtime = "edge";

export { default, alt, size, contentType } from "./opengraph-image";
