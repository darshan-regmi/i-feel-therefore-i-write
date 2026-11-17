import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeNext";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/liked")).toBe("/liked");
    expect(safeNextPath("/entries/hello-abc")).toBe("/entries/hello-abc");
  });

  it("falls back for missing or off-site targets", () => {
    expect(safeNextPath(null)).toBe("/profile");
    expect(safeNextPath("")).toBe("/profile");
    expect(safeNextPath("https://evil.example")).toBe("/profile");
    expect(safeNextPath("//evil.example")).toBe("/profile");
    expect(safeNextPath("/\\evil.example")).toBe("/profile");
  });

  it("does not loop back into an auth page", () => {
    expect(safeNextPath("/login")).toBe("/profile");
    expect(safeNextPath("/signup?next=/liked")).toBe("/profile");
    expect(safeNextPath("/forget-password")).toBe("/profile");
  });
});
