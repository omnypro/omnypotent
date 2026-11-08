import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

type Tree = Record<string, unknown>;

export function sketchTokens(figma: Tree, semantic: Tree): Tree {
  for (const key of Object.keys(semantic)) {
    if (key in figma) throw new Error(`both files define "${key}"`);
  }
  return { ...figma, ...semantic };
}

if (import.meta.main) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const figma = await Bun.file(`${root}tokens/figma/variables.json`).json();
  const semantic = await Bun.file(`${root}tokens/semantic/dark.json`).json();
  await mkdir(`${root}sketch`, { recursive: true });
  const out = `${root}sketch/omnypotent.tokens.json`;
  await Bun.write(
    out,
    `${JSON.stringify(sketchTokens(figma, semantic), null, 2)}\n`,
  );
  console.log(out);
}
