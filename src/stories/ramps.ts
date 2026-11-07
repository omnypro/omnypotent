export type Ramp = [group: string, entries: [name: string, value: string][]];

export function rampGroups(
  colors: Record<string, string>,
  semanticNames: string[],
): Ramp[] {
  const groups = new Map<string, [string, string][]>();
  for (const [name, value] of Object.entries(colors)) {
    if (semanticNames.includes(name)) continue;
    const group = name.slice(0, name.lastIndexOf("-"));
    groups.set(group, [...(groups.get(group) ?? []), [name, value]]);
  }
  return [...groups.entries()];
}
