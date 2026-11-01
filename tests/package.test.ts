import { expect, test } from "bun:test";

const pkg = await Bun.file(new URL("../package.json", import.meta.url)).json();

test("the package is public and named for the omnypro scope", () => {
  expect(pkg.name).toBe("@omnypro/omnypotent");
  expect(pkg.type).toBe("module");
  expect(pkg.private).toBeUndefined();
});

test("only dist is published", () => {
  expect(pkg.files).toEqual(["dist"]);
});

test("the exports map points at built files", () => {
  expect(pkg.exports["./tokens.css"]).toBe("./dist/tokens.css");
  expect(pkg.exports["./fonts.css"]).toBe("./dist/fonts.css");
  expect(pkg.exports["."].import).toBe("./dist/index.js");
  expect(pkg.exports["."].types).toBe("./dist/index.d.ts");
});
