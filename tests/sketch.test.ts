import { expect, test } from "bun:test";
import { sketchTokens } from "../scripts/sketch.ts";

const figma = await Bun.file("tokens/figma/variables.json").json();
const semantic = await Bun.file("tokens/semantic/dark.json").json();

const find = (tree: unknown, path: string) =>
  path
    .split(".")
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown> | undefined)?.[key],
      tree,
    );

test("the Sketch file holds the Figma colors and the semantic colors", () => {
  const merged = sketchTokens(figma, semantic);
  expect(Object.keys(merged)).toEqual(
    expect.arrayContaining(["Color", "semantic"]),
  );
  expect(merged.Color).toEqual(figma.Color);
  expect(merged.semantic).toEqual(semantic.semantic);
});

test("every semantic alias points at a token in the Sketch file", () => {
  const merged = sketchTokens(figma, semantic);
  const group = merged.semantic as Record<string, { $value?: string }>;
  for (const [name, token] of Object.entries(group)) {
    if (name.startsWith("$")) continue;
    const reference = token.$value!.match(/^\{(.+)\}$/)![1]!;
    expect(find(merged, reference)).toBeDefined();
  }
});

test("a group name used by both files is an error", () => {
  expect(() => sketchTokens(figma, { Color: {} })).toThrow(
    'both files define "Color"',
  );
});
