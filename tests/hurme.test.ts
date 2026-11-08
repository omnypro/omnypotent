import { expect, test } from "bun:test";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "../scripts/build.ts";
import { hurmeCss } from "../scripts/hurme.ts";

const CDN = "https://cdn.omnyist.productions/hurme";

test("hurme.css has one face per style, seven weights in two slants", () => {
  const faces = hurmeCss().split("@font-face").slice(1);
  expect(faces).toHaveLength(14);
  const weights = faces.map((f) => f.match(/font-weight: (\d+);/)![1]);
  expect([...new Set(weights)].sort()).toEqual([
    "100",
    "200",
    "300",
    "400",
    "600",
    "700",
    "900",
  ]);
  expect(faces.filter((f) => f.includes("font-style: normal;"))).toHaveLength(
    7,
  );
  expect(faces.filter((f) => f.includes("font-style: oblique;"))).toHaveLength(
    7,
  );
});

test("hurme.css points at the CDN with woff2 before woff", () => {
  const css = hurmeCss();
  expect(css).toContain('font-family: "Hurme Geometric Sans 2";');
  expect(css).toContain("font-display: swap;");
  expect(css).toContain(
    `url("${CDN}/HurmeGeometricSans2-SemiBoldOblique.woff2") format("woff2"),\n    url("${CDN}/HurmeGeometricSans2-SemiBoldOblique.woff") format("woff")`,
  );
  expect(css).not.toContain("./");
});

test("the build writes hurme.css and ships no Hurme font file", async () => {
  const outDir = await mkdtemp(join(tmpdir(), "omnypotent-"));
  await build({ outDir });
  expect(await readFile(join(outDir, "hurme.css"), "utf8")).toBe(hurmeCss());
  expect(await Bun.file(join(outDir, "fonts.json")).text()).not.toContain(
    "Hurme",
  );
});
