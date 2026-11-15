// Google's OAuth flow is blocked inside embedded webviews, so the login page
// hides Google sign-in there instead of sending the visitor into a dead end.
// Email and password work in any browser, so nothing else is affected.

const IN_APP_BROWSER_PATTERNS: RegExp[] = [
  /Instagram/i,
  // Facebook's iOS and Android webviews both append these tokens.
  /FBAN|FBAV/i,
  /Line\//i,
  /TikTok|musical_ly/i,
  /Snapchat/i,
];

/**
 * True when the user agent belongs to an in-app browser that cannot complete
 * Google sign-in. Pass navigator.userAgent; keep this pure so it can be tested
 * against real UA strings.
 */
export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_BROWSER_PATTERNS.some((pattern) => pattern.test(userAgent));
}
