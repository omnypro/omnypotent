import { expect, test } from "bun:test";
import { rampGroups } from "../src/stories/ramps.ts";

test("ramp tokens group by the name before the last dash, in order", () => {
  const colors = {
    "neutral-1": "#111111",
    "neutral-2": "#222222",
    "secondary-1": "#333333",
    "black-5": "rgba(0, 0, 0, 0.05)",
    surface: "#444444",
    "text-muted": "#555555",
  };
  expect(rampGroups(colors, ["surface", "text-muted"])).toEqual([
    [
      "neutral",
      [
        ["neutral-1", "#111111"],
        ["neutral-2", "#222222"],
      ],
    ],
    ["secondary", [["secondary-1", "#333333"]]],
    ["black", [["black-5", "rgba(0, 0, 0, 0.05)"]]],
  ]);
});
