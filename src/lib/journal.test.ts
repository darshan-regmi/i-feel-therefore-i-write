import { describe, expect, it } from "vitest";
import {
  buildEntries,
  entryShortMeta,
  extractPoemId,
  formatLongDate,
  formatMonth,
  formatShortDate,
  poemSlug,
  slugifyTitle,
} from "./journal";
import type { Poem } from "./notion";

function poem(id: string, title: string, createdAt: string): Poem {
  return {
    id,
    title,
    content: "",
    description: null,
    createdAt,
    updatedAt: createdAt,
  };
}

describe("journal dates", () => {
  it("formats in the site timezone", () => {
    const date = new Date("2026-11-14T18:30:00.000Z");
    expect(formatLongDate(date)).toBe("15 nov 2026");
    expect(formatShortDate(date)).toBe("15 nov");
    expect(formatMonth(date)).toBe("november 2026");
  });
});

describe("entry numbers", () => {
  it("starts at 001 with the oldest poem and pads to three digits", () => {
    const entries = buildEntries([
      poem("b".repeat(32), "newer", "2026-11-15T00:00:00.000Z"),
      poem("a".repeat(32), "older", "2026-11-01T00:00:00.000Z"),
    ]);

    expect(entries.map((entry) => entry.number)).toEqual(["001", "002"]);
    expect(entryShortMeta(entries[0])).toBe("001 · 01 nov");
  });

  it("breaks equal timestamps by id so numbers are stable", () => {
    const entries = buildEntries([
      poem("c".repeat(32), "c", "2026-01-01T00:00:00.000Z"),
      poem("a".repeat(32), "a", "2026-01-01T00:00:00.000Z"),
      poem("b".repeat(32), "b", "2026-01-01T00:00:00.000Z"),
    ]);

    expect(entries.map((entry) => entry.poem.title)).toEqual(["a", "b", "c"]);
  });
});

describe("poem slugs", () => {
  const id = "0123456789abcdef0123456789abcdef";

  it("lowercases and hyphenates titles", () => {
    expect(slugifyTitle("Friday, 11 PM")).toBe("friday-11-pm");
    expect(slugifyTitle("you’re leaving")).toBe("youre-leaving");
    expect(slugifyTitle("wasting…")).toBe("wasting");
    expect(slugifyTitle("!!!")).toBe("untitled");
  });

  it("keeps duplicate titles distinct through the Notion id", () => {
    const a = poem("a".repeat(32), "untitled", "2026-01-01T00:00:00.000Z");
    const b = poem("b".repeat(32), "untitled", "2026-01-02T00:00:00.000Z");
    expect(poemSlug(a)).not.toBe(poemSlug(b));
  });

  it("extracts the stable id from a slug", () => {
    expect(extractPoemId(`i-would-${id}`)).toBe(id);
    expect(extractPoemId(id)).toBe(id);
    expect(extractPoemId("i-would")).toBeNull();
  });
});
