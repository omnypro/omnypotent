import { expect, test } from "bun:test";
import { toModule } from "../scripts/emit-module.ts";

test("a nested object becomes a const and a literal-typed declaration", () => {
  const { js, dts } = toModule("t", { a: { b: "x" } });
  expect(js).toBe('export const t = {"a":{"b":"x"}};\n');
  expect(dts).toBe(
    'export declare const t: { readonly a: { readonly b: "x" } };\n',
  );
});

test("keys that are not identifiers are quoted in the declaration", () => {
  const { dts } = toModule("t", { "neutral-1": "#F3F4FA" });
  expect(dts).toBe(
    'export declare const t: { readonly "neutral-1": "#F3F4FA" };\n',
  );
});

test("quotes and backslashes in strings survive in both outputs", () => {
  const { js, dts } = toModule("t", { f: '"Space Mono", \\' });
  expect(js).toBe('export const t = {"f":"\\"Space Mono\\", \\\\"};\n');
  expect(dts).toBe(
    'export declare const t: { readonly f: "\\"Space Mono\\", \\\\" };\n',
  );
});
