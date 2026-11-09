import { expect, test } from "bun:test";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../scripts/build.ts";
import { contrastRatio } from "../scripts/contrast.ts";
import { resolveHex, themeCss } from "../scripts/themes.ts";

const repo = fileURLToPath(new URL("..", import.meta.url));
const ROLES = ["surface", "text"];

const tree = {
  demo: {
    $type: "color",
    ink: { $value: "#FF8000" },
    ground: { "50": { $value: "#101010" } },
  },
  semantic: {
    $type: "color",
    surface: { $value: "{demo.ground.50}" },
    text: { $value: "{demo.ink}" },
  },
};

const read = async (path: string) =>
  JSON.parse(await readFile(join(repo, path), "utf8"));

test("a theme is scoped to its data attribute and writes Display P3 colors", () => {
  const css = themeCss("demo", tree, ROLES);
  expect(css).toContain('[data-theme="demo"] {');
  expect(css).not.toContain(":root");
  expect(css).toContain("--color-demo-ink: color(display-p3 1 0.502 0);");
  expect(css).toContain(
    "--color-demo-ground-50: color(display-p3 0.0627 0.0627 0.0627);",
  );
});

test("semantic tokens keep the base names and reference the theme's colors", () => {
  const css = themeCss("demo", tree, ROLES);
  expect(css).toContain("--color-surface: var(--color-demo-ground-50);");
  expect(css).toContain("--color-text: var(--color-demo-ink);");
});

test("a theme that lacks a semantic token fails with its name", () => {
  const { text: _text, ...partial } = tree.semantic;
  expect(() => themeCss("demo", { ...tree, semantic: partial }, ROLES)).toThrow(
    'Theme "demo" is missing semantic token "text"',
  );
});

test("a theme cannot add a semantic name the base does not have", () => {
  const extra = { ...tree.semantic, glow: { $value: "{demo.ink}" } };
  expect(() => themeCss("demo", { ...tree, semantic: extra }, ROLES)).toThrow(
    'Theme "demo" defines "glow", which is not a semantic token',
  );
});

test("a reference that does not resolve fails with its path", () => {
  const broken = { ...tree.semantic, text: { $value: "{demo.nope}" } };
  expect(() => themeCss("demo", { ...tree, semantic: broken }, ROLES)).toThrow(
    'semantic.text: "{demo.nope}" does not resolve',
  );
});

test("a value that is not a six digit hex or a reference fails", () => {
  const bad = { ...tree, demo: { ...tree.demo, ink: { $value: "orange" } } };
  expect(() => themeCss("demo", bad, ROLES)).toThrow(
    'demo.ink: "orange" is not a #RRGGBB hex or a reference',
  );
});

test("the build writes dist/themes/perpetual.css with every semantic token", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "omnypotent-"));
  await build({ outDir });
  const css = await readFile(join(outDir, "themes/perpetual.css"), "utf8");
  const base = await read("tokens/semantic/dark.json");
  for (const role of Object.keys(base.semantic).filter(
    (k) => !k.startsWith("$"),
  )) {
    expect(css).toContain(`--color-${role}: var(--color-perpetual-`);
  }
  expect(css).toContain("--color-accent: var(--color-perpetual-time-400);");
});

test("the build fails when a theme drops a semantic token", async () => {
  const root = await mkdtemp(join(tmpdir(), "omnypotent-"));
  await cp(join(repo, "tokens"), join(root, "tokens"), { recursive: true });
  const file = join(root, "tokens/themes/perpetual.json");
  const theme = JSON.parse(await readFile(file, "utf8"));
  delete theme.semantic.accent;
  await writeFile(file, JSON.stringify(theme));
  expect(build({ root, outDir: join(root, "dist") })).rejects.toThrow(
    'Theme "perpetual" is missing semantic token "accent"',
  );
});

test("Perpetual's text and muted text read against its surface", async () => {
  const theme = await read("tokens/themes/perpetual.json");
  const surface = resolveHex(theme, "semantic.surface");
  expect(surface).toBe("#1F1F1F");
  expect(
    contrastRatio(resolveHex(theme, "semantic.text"), surface),
  ).toBeGreaterThan(4.5);
  expect(
    contrastRatio(resolveHex(theme, "semantic.text-muted"), surface),
  ).toBeGreaterThan(4.5);
  expect(
    contrastRatio(resolveHex(theme, "semantic.accent"), surface),
  ).toBeGreaterThan(4.5);
});

test("a border can be told apart from a raised surface", async () => {
  const theme = await read("tokens/themes/perpetual.json");
  expect(resolveHex(theme, "semantic.border")).not.toBe(
    resolveHex(theme, "semantic.surface-raised"),
  );
});
