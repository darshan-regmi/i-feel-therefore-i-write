// Twitter card reuses the OG image. Route segment config must be declared
// literally here — Next.js's static analyzer can't trace re-exported constants
// across files, which silently flips the route back to the Node runtime and
// breaks Cloudflare Pages builds.
export const runtime = "edge";
export const revalidate = 3600;

export { default, alt, size, contentType } from "./opengraph-image";
