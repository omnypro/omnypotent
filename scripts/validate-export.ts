export type ExportIssue = { path: string; message: string };

type Json = Record<string, unknown>;

const HEX = /^#[0-9A-Fa-f]{6}$/;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const range = (count: number, from: number, step: number) =>
  Array.from({ length: count }, (_, i) => from + i * step);

const STEPS: Record<string, string[]> = {
  "Color/Neutral": range(9, 1, 1).map((n) => `neutral-${n}`),
  "Color/Primary": range(9, 1, 1).map((n) => `primary-${n}`),
  "Color/Utility/Black": range(21, 0, 5).map((n) => `black-${n}`),
  "Color/Utility/White": range(21, 0, 5).map((n) => `white-${n}`),
};

const inUnitRange = (value: unknown) =>
  typeof value === "number" && value >= 0 && value <= 1;

function checkToken(path: string, token: Json, issues: ExportIssue[]) {
  const report = (message: string) => issues.push({ path, message });
  const value = token.$value;

  if (token.$type !== "color") {
    report(`$type is ${JSON.stringify(token.$type)}, expected "color"`);
    return;
  }
  if (!isObject(value)) {
    report("$value is not an object");
    return;
  }
  if (value.colorSpace !== "srgb") report("colorSpace is not srgb");
  const components = value.components;
  if (
    !Array.isArray(components) ||
    components.length !== 3 ||
    !components.every(inUnitRange)
  ) {
    report("components must be three numbers from 0 to 1");
  }
  if (!inUnitRange(value.alpha)) report("alpha must be a number from 0 to 1");
  if (typeof value.hex !== "string" || !HEX.test(value.hex)) {
    report("hex must look like #RRGGBB");
  }
  const extensions = token.$extensions;
  if (
    !isObject(extensions) ||
    typeof extensions["com.figma.variableId"] !== "string"
  ) {
    report("missing com.figma.variableId");
  }
}

function checkSteps(path: string, group: Json, issues: ExportIssue[]) {
  for (const name of STEPS[path] ?? []) {
    if (!(name in group)) issues.push({ path, message: `missing ${name}` });
  }
}

function walk(node: Json, path: string[], issues: ExportIssue[]) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$") || !isObject(child)) continue;
    const childPath = [...path, key];
    if ("$value" in child || "$type" in child) {
      checkToken(childPath.join("/"), child, issues);
      continue;
    }
    checkSteps(childPath.join("/"), child, issues);
    walk(child, childPath, issues);
  }
}

export function validateExport(data: unknown): ExportIssue[] {
  if (!isObject(data) || !isObject(data.Color)) {
    return [{ path: "", message: "missing top-level Color group" }];
  }
  const issues: ExportIssue[] = [];
  walk(data.Color, ["Color"], issues);
  for (const required of Object.keys(STEPS)) {
    const missing = required
      .split("/")
      .slice(1)
      .reduce<unknown>(
        (node, key) => (isObject(node) ? node[key] : undefined),
        data.Color,
      );
    if (!isObject(missing)) {
      issues.push({ path: required, message: "missing group" });
    }
  }
  return issues;
}

if (import.meta.main) {
  const file =
    process.argv[2] ??
    new URL("../tokens/figma/variables.json", import.meta.url).pathname;
  const issues = validateExport(await Bun.file(file).json());
  for (const issue of issues) console.log(`${issue.path}: ${issue.message}`);
  process.exit(issues.length === 0 ? 0 : 1);
}
