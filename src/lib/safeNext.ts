/**
 * Sign-in can return a visitor to the page they came from, but only inside this
 * site. Anything that is not a plain absolute path — protocol-relative URLs,
 * schemes, empty values, or another auth page — falls back to the profile.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  // Backslashes are normalised to slashes by some browsers, so `/\evil.com`
  // must not be treated as a path.
  if (value.includes("\\")) {
    return "/profile";
  }

  const authPages = ["/login", "/signup", "/forget-password"];
  if (authPages.some((page) => value === page || value.startsWith(`${page}?`))) {
    return "/profile";
  }

  return value;
}
