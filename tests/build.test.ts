import { expect, test } from "bun:test";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "../scripts/build.ts";
import { contrastRatio } from "../scripts/contrast.ts";

const repo = new URL("..", import.meta.url).pathname;

const tempDir = () => mkdtemp(join(tmpdir(), "omnypotent-"));

async function builtCss() {
  const outDir = await tempDir();
  await build({ outDir });
  return readFile(join(outDir, "tokens.css"), "utf8");
}

async function tempRoot() {
  const root = await tempDir();
  await cp(join(repo, "tokens"), join(root, "tokens"), { recursive: true });
  return root;
}

test("tokens.css has the ramps, alpha colors, semantic references and type", async () => {
  const css = await builtCss();
  expect(css).toContain("color-scheme: dark;");
  expect(css).toContain("--color-neutral-1: #F3F4FA;");
  expect(css).toContain("--color-black-50: rgba(0, 0, 0, 0.5);");
  expect(css).toContain("--color-surface: var(--color-neutral-8);");
  expect(css).toContain("--font-size-base: 1rem;");
});

test("every custom property name is lowercase kebab-case", async () => {
  const css = await builtCss();
  const names = [...css.matchAll(/^\s*(--[^:\s]+):/gm)].map((m) => m[1]);
  expect(names.length).toBeGreaterThan(60);
  for (const name of names) expect(name).toMatch(/^--[a-z0-9-]+$/);
});

const exportJson = await Bun.file(
  join(repo, "tokens/figma/variables.json"),
).json();
const dark = await Bun.file(join(repo, "tokens/semantic/dark.json")).json();

function hexOf(semanticName: string): string {
  const reference: string = dark.semantic[semanticName].$value;
  const path = reference.slice(1, -1).split(".");
  const token = path.reduce((node, key) => node[key], exportJson);
  return token.$value.hex;
}

const PAIRS = [
  ["text", "surface"],
  ["text", "surface-raised"],
  ["text-muted", "surface"],
  ["text-muted", "surface-raised"],
  ["accent", "surface"],
  ["accent", "surface-raised"],
] as const;

for (const [foreground, background] of PAIRS) {
  test(`${foreground} on ${background} meets AA`, () => {
    expect(
      contrastRatio(hexOf(foreground), hexOf(background)),
    ).toBeGreaterThanOrEqual(4.5);
  });
}

test("a semantic reference to a missing ramp step fails the build", async () => {
  const root = await tempRoot();
  const file = join(root, "tokens/semantic/dark.json");
  const text = await readFile(file, "utf8");
  await writeFile(file, text.replace("neutral-8", "neutral-99"));
  const error = await build({ root, outDir: await tempDir() }).catch(
    (e: Error) => e,
  );
  expect(error).toBeInstanceOf(Error);
  expect(String(error)).toContain("neutral-99");
});

test("an invalid export fails the build with the token path", async () => {
  const root = await tempRoot();
  const file = join(root, "tokens/figma/variables.json");
  const data = await Bun.file(file).json();
  delete data.Color.Neutral["neutral-9"];
  await writeFile(file, JSON.stringify(data));
  const error = await build({ root, outDir: await tempDir() }).catch(
    (e: Error) => e,
  );
  expect(error).toBeInstanceOf(Error);
  expect(String(error)).toContain("Color/Neutral: missing neutral-9");
});

test("two builds are byte-identical", async () => {
  const [a, b] = [await tempDir(), await tempDir()];
  await build({ outDir: a });
  await build({ outDir: b });
  expect(await readFile(join(a, "tokens.css"), "utf8")).toBe(
    await readFile(join(b, "tokens.css"), "utf8"),
  );
});

test("a build run from another working directory gives the same output", async () => {
  const [inProcess, spawned] = [await tempDir(), await tempDir()];
  await build({ outDir: inProcess });
  const proc = Bun.spawn(["bun", join(repo, "scripts/build.ts")], {
    cwd: "/",
    env: { ...process.env, OUT_DIR: spawned },
    stdout: "ignore",
    stderr: "pipe",
  });
  expect(await proc.exited).toBe(0);
  expect(await readFile(join(spawned, "tokens.css"), "utf8")).toBe(
    await readFile(join(inProcess, "tokens.css"), "utf8"),
  );
});
