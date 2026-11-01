import { expect, test } from "bun:test";
import { validateExport } from "../scripts/validate-export.ts";

const real = await Bun.file(
  new URL("../tokens/figma/variables.json", import.meta.url),
).json();

const copy = (): any => structuredClone(real);

test("the committed export has no issues", () => {
  expect(validateExport(real)).toEqual([]);
});

test("an out-of-range component is reported at its token path", () => {
  const data = copy();
  data.Color.Neutral["neutral-3"].$value.components[0] = 2;
  const issues = validateExport(data);
  expect(issues).toHaveLength(1);
  expect(issues[0]?.path).toBe("Color/Neutral/neutral-3");
});

test("a missing ramp step is reported by name", () => {
  const data = copy();
  delete data.Color.Neutral["neutral-9"];
  const issues = validateExport(data);
  expect(issues.some((i) => i.message.includes("neutral-9"))).toBe(true);
});

test("a new valid group passes", () => {
  const data = copy();
  data.Color.Secondary = {
    "secondary-1": structuredClone(data.Color.Primary["primary-1"]),
    "secondary-2": structuredClone(data.Color.Primary["primary-2"]),
    "secondary-3": structuredClone(data.Color.Primary["primary-3"]),
  };
  expect(validateExport(data)).toEqual([]);
});

test("a renamed Figma mode passes", () => {
  const data = copy();
  data.$extensions["com.figma.modeName"] = "Brand";
  expect(validateExport(data)).toEqual([]);
});

test("a missing Color group is reported", () => {
  const issues = validateExport({});
  expect(issues).toHaveLength(1);
  expect(issues[0]?.path).toBe("");
});

test("a token that is not a color is reported", () => {
  const data = copy();
  data.Color.Neutral["neutral-1"].$type = "number";
  const issues = validateExport(data);
  expect(issues).toHaveLength(1);
  expect(issues[0]?.path).toBe("Color/Neutral/neutral-1");
});

test("a malformed hex is reported", () => {
  const data = copy();
  data.Color.Primary["primary-2"].$value.hex = "B4F6E9";
  const issues = validateExport(data);
  expect(issues).toHaveLength(1);
  expect(issues[0]?.path).toBe("Color/Primary/primary-2");
});

test("a token without a Figma variable ID is reported", () => {
  const data = copy();
  delete data.Color.Utility.White["white-10"].$extensions[
    "com.figma.variableId"
  ];
  const issues = validateExport(data);
  expect(issues).toHaveLength(1);
  expect(issues[0]?.path).toBe("Color/Utility/White/white-10");
});
