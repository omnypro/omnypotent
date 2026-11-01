export type ColorValue = {
  components: [number, number, number];
  alpha?: number;
  hex: string;
};

export function toCssColor(value: ColorValue): string {
  const { components, alpha = 1, hex } = value;
  if (alpha === 1) return hex.toUpperCase();
  const [r, g, b] = components.map((c) => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(3))})`;
}
