import { expect, test } from "bun:test";
import { cssName } from "../scripts/names.ts";

test("a Figma ramp token drops its group", () => {
  expect(cssName(["Color", "Neutral", "neutral-1"])).toBe("color-neutral-1");
});

test("a nested utility token drops both groups", () => {
  expect(cssName(["Color", "Utility", "Black", "black-5"])).toBe(
    "color-black-5",
  );
});

test("a semantic token gets the color prefix", () => {
  expect(cssName(["semantic", "text-muted"])).toBe("color-text-muted");
});

test("other tokens join their whole path", () => {
  expect(cssName(["font", "size", "lg"])).toBe("font-size-lg");
  expect(cssName(["font", "family", "sans"])).toBe("font-family-sans");
});
