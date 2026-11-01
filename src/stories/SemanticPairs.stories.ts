import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = { title: "Foundations/Semantic pairs" } satisfies Meta;

export default meta;

const pair = (foreground: string, background: string): StoryObj => ({
  name: `${foreground} on ${background}`,
  render: () =>
    `<p style="margin:0;padding:1rem;font-size:var(--font-size-lg);color:var(--color-${foreground});background:var(--color-${background})">The quick brown fox jumps over the lazy dog.</p>`,
});

export const TextOnSurface = pair("text", "surface");
export const TextOnSurfaceRaised = pair("text", "surface-raised");
export const TextMutedOnSurface = pair("text-muted", "surface");
export const TextMutedOnSurfaceRaised = pair("text-muted", "surface-raised");
export const AccentOnSurface = pair("accent", "surface");
export const AccentOnSurfaceRaised = pair("accent", "surface-raised");
