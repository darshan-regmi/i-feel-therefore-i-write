import { notFound } from "next/navigation";

/**
 * This used to render an inline "you've wandered off" page with a 200 status —
 * a soft 404. Google treats those as valid pages, so a dead end competed with
 * the real indexable routes and absorbed link equity.
 *
 * The root not-found.tsx already has matching copy and the same /poem link, so
 * delegating to it returns a real 404 status with no change in experience.
 * /poem/[id] uses notFound() the same way for missing poems.
 */
export default function LostPoemPage(): never {
  notFound();
}