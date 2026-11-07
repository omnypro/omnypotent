import { expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { build } from "../scripts/build.ts";

await build();

const proc = Bun.spawn(["npm", "pack", "--dry-run", "--json"], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  stdout: "pipe",
  stderr: "ignore",
});
const [report] = JSON.parse(await new Response(proc.stdout).text());
const files: string[] = report.files.map((f: { path: string }) => f.path);

test("the tarball has every built output and both font licenses", () => {
  for (const file of [
    "dist/tokens.css",
    "dist/fonts.css",
    "dist/tokens.json",
    "dist/fonts.json",
    "dist/index.js",
    "dist/index.d.ts",
    "dist/fonts/LICENSE-space-grotesk.txt",
    "dist/fonts/LICENSE-space-mono.txt",
  ]) {
    expect(files).toContain(file);
  }
});

test("the tarball holds dist, package.json, the README and the license, and nothing else", () => {
  const others = files.filter((f) => !f.startsWith("dist/"));
  expect(others.sort()).toEqual(["LICENSE", "README.md", "package.json"]);
});
