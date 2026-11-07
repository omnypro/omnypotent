import { expect, test } from "bun:test";
import { contrastRatio } from "../scripts/contrast.ts";

test("black on white is 21:1", () => {
  expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
});

test("the ratio is symmetric", () => {
  expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 1);
});

test("Neutral 8 against Neutral 1 matches the figure in the spec", () => {
  expect(contrastRatio("#0E0F16", "#F3F4FA")).toBeCloseTo(17.4, 1);
});

test("a color against itself is 1:1", () => {
  expect(contrastRatio("#3CE5C7", "#3CE5C7")).toBe(1);
});
