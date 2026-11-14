import { describe, expect, it } from "vitest";
import { isInAppBrowser } from "./inAppBrowser";

// Strings captured from the browsers themselves, trimmed where the tail does
// not affect detection. Keep them realistic: a pattern that only matches an
// invented UA is not evidence.
const DESKTOP_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const INSTAGRAM_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.32.90 (iPhone14,5; iOS 17_5; en_US; en; scale=3.00; 1170x2532; 62004597)";

const FACEBOOK_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/469.0.0.43.107;FBBV/561742509;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]";

const FACEBOOK_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP1A.240505.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.82 Mobile Safari/537.36 [FBAN/EMA;FBAV/465.0.0.0.71;FBBV/556622854;FBDV/Pixel 8;FBMD/Google;FBSN/Android;FBSV/14;FBSS/2;FBID/phone;FBLC/en_US;FBOP/5]";

const LINE_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1 Line/13.17.0";

const TIKTOK_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 TikTok 35.1.3 (iPhone14,5; iOS 17.5; en_US; scale=3.00; 1170x2532)";

const SNAPCHAT_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/12.95.0.40 (iPhone14,5; iOS 17.5; gzip)";

describe("isInAppBrowser", () => {
  it("leaves ordinary browsers alone", () => {
    expect(isInAppBrowser(DESKTOP_CHROME)).toBe(false);
    expect(isInAppBrowser(IPHONE_SAFARI)).toBe(false);
    expect(isInAppBrowser("")).toBe(false);
  });

  it("recognises Instagram", () => {
    expect(isInAppBrowser(INSTAGRAM_IOS)).toBe(true);
  });

  it("recognises both Facebook webviews", () => {
    expect(isInAppBrowser(FACEBOOK_IOS)).toBe(true);
    expect(isInAppBrowser(FACEBOOK_ANDROID)).toBe(true);
  });

  it("recognises Line", () => {
    expect(isInAppBrowser(LINE_IOS)).toBe(true);
  });

  it("recognises TikTok", () => {
    expect(isInAppBrowser(TIKTOK_IOS)).toBe(true);
  });

  it("recognises Snapchat", () => {
    expect(isInAppBrowser(SNAPCHAT_IOS)).toBe(true);
  });
});
