import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "../scripts/build.ts";

async function builtDir() {
  const outDir = await mkdtemp(join(tmpdir(), "omnypotent-"));
  await build({ outDir });
  return outDir;
}

const read = (dir: string, file: string) => readFile(join(dir, file), "utf8");

test("fonts.json lists the shipped files with no CDN URL", async () => {
  const dir = await builtDir();
  const manifest = JSON.parse(await read(dir, "fonts.json"));
  expect(manifest).toHaveLength(5);
  for (const font of manifest) {
    expect(existsSync(join(dir, font.path))).toBe(true);
    expect(font.url).toBeNull();
    expect(font.style).toBe("normal");
  }
  const mono = manifest.filter(
    (f: { family: string }) => f.family === "Space Mono",
  );
  expect(mono.map((f: { weight: string }) => f.weight).sort()).toEqual([
    "400",
    "400",
    "700",
    "700",
  ]);
});

test("fonts.css declares both families with relative woff2-first sources", async () => {
  const css = await read(await builtDir(), "fonts.css");
  expect(css).toContain('font-family: "Space Grotesk Variable";');
  expect(css).toContain("font-weight: 300 700;");
  expect(css).toContain('font-family: "Space Mono";');
  expect(css).toContain("font-display: swap;");
  expect(css).toMatch(
    /url\("\.\/fonts\/space-mono-latin-400-normal\.woff2"\) format\("woff2"\),\s+url\("\.\/fonts\/space-mono-latin-400-normal\.woff"\) format\("woff"\)/,
  );
});

test("every family in the manifest is named in a font family token", async () => {
  const dir = await builtDir();
  const manifest = JSON.parse(await read(dir, "fonts.json"));
  const tokens = JSON.parse(await read(dir, "tokens.json"));
  const stacks = Object.values(tokens.font.family) as string[];
  for (const { family } of manifest) {
    expect(stacks.some((stack) => stack.includes(`"${family}"`))).toBe(true);
  }
});

test("only Space Grotesk and Space Mono files and licenses ship", async () => {
  const dir = await builtDir();
  const files = await readdir(join(dir, "fonts"));
  expect(files.length).toBe(7);
  for (const file of files) {
    expect(file).toMatch(
      /^(space-grotesk-|space-mono-|LICENSE-space-grotesk\.txt$|LICENSE-space-mono\.txt$)/,
    );
  }
  for (const license of [
    "LICENSE-space-grotesk.txt",
    "LICENSE-space-mono.txt",
  ]) {
    expect(await read(dir, `fonts/${license}`)).toContain("Open Font License");
  }
});

test("index.js exports the manifest and index.d.ts declares it", async () => {
  const dir = await builtDir();
  const module = await import(join(dir, "index.js"));
  expect(module.fonts).toEqual(JSON.parse(await read(dir, "fonts.json")));
  expect(await read(dir, "index.d.ts")).toContain(
    "export declare const fonts:",
  );
});

test("the font outputs are byte-identical across builds", async () => {
  const [a, b] = [await builtDir(), await builtDir()];
  for (const file of ["fonts.css", "fonts.json", "index.js", "index.d.ts"]) {
    expect(await read(a, file)).toBe(await read(b, file));
  }
});
