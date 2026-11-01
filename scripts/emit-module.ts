const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function literalType(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const members = Object.entries(value).map(([key, member]) => {
      const name = IDENTIFIER.test(key) ? key : JSON.stringify(key);
      return `readonly ${name}: ${literalType(member)}`;
    });
    return `{ ${members.join("; ")} }`;
  }
  throw new Error(`Cannot declare a ${typeof value} in a token module`);
}

export function toModule(
  name: string,
  value: unknown,
): { js: string; dts: string } {
  return {
    js: `export const ${name} = ${JSON.stringify(value)};\n`,
    dts: `export declare const ${name}: ${literalType(value)};\n`,
  };
}
