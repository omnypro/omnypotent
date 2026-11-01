import { expect, test } from "bun:test";
import { toCssColor } from "../scripts/color.ts";

test("a half-transparent black prints as rgba", () => {
  expect(
    toCssColor({ components: [0, 0, 0], alpha: 0.5, hex: "#000000" }),
  ).toBe("rgba(0, 0, 0, 0.5)");
});

test("alpha 0 prints as rgba, not hex", () => {
  expect(toCssColor({ components: [0, 0, 0], alpha: 0, hex: "#000000" })).toBe(
    "rgba(0, 0, 0, 0)",
  );
});

test("alpha 1 prints the uppercased hex", () => {
  expect(
    toCssColor({
      components: [0.953, 0.957, 0.98],
      alpha: 1,
      hex: "#f3f4fa",
    }),
  ).toBe("#F3F4FA");
});

test("a missing alpha prints the hex", () => {
  expect(toCssColor({ components: [0, 0, 0], hex: "#0A0B10" })).toBe("#0A0B10");
});

test("small alphas keep their leading zero", () => {
  expect(
    toCssColor({ components: [0, 0, 0], alpha: 0.05, hex: "#000000" }),
  ).toBe("rgba(0, 0, 0, 0.05)");
});

test("float32 noise in alpha is rounded away", () => {
  expect(
    toCssColor({
      components: [0, 0, 0],
      alpha: 0.05000000074505806,
      hex: "#000000",
    }),
  ).toBe("rgba(0, 0, 0, 0.05)");
});

test("components are scaled to 0-255 and rounded", () => {
  expect(
    toCssColor({
      components: [0.9529411792755127, 0.95686274766922, 0.9803921580314636],
      alpha: 0.5,
      hex: "#F3F4FA",
    }),
  ).toBe("rgba(243, 244, 250, 0.5)");
});
