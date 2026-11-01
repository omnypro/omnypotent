export function cssName(path: string[]): string {
  const [first, ...rest] = path;
  if (first === "Color") return `color-${path.at(-1)!.toLowerCase()}`;
  if (first === "semantic") return ["color", ...rest].join("-");
  return path.map((segment) => segment.toLowerCase()).join("-");
}
