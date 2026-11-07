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

test("arrays become readonly tuples and null stays null", () => {
  const { js, dts } = toModule("f", [{ a: "x", u: null }]);
  expect(js).toBe('export const f = [{"a":"x","u":null}];\n');
  expect(dts).toBe(
    'export declare const f: readonly [{ readonly a: "x"; readonly u: null }];\n',
  );
});

test("an empty array is an empty tuple", () => {
  expect(toModule("f", []).dts).toBe("export declare const f: readonly [];\n");
});
