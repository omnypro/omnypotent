# @omnypro/omnypotent

The Omnyist Productions brand system: color tokens, typefaces and a Storybook
reference. It has no components. The first version is dark only.

## Install

```sh
npm install @omnypro/omnypotent
```

## Use

CSS, from any bundler or a `<link>`:

```css
@import "@omnypro/omnypotent/tokens.css";
@import "@omnypro/omnypotent/fonts.css";
```

`tokens.css` defines custom properties on `:root`: `--color-*` (the Figma
ramps and the semantic tokens such as `--color-surface` and `--color-text`),
`--font-family-*` and `--font-size-*`. Semantic tokens reference the ramps with
`var()`.

Plain values, for anything that cannot read CSS variables (such as the OG image
renderer):

```ts
import { tokens, fonts } from "@omnypro/omnypotent";

tokens.color.surface; // "#0E0F16"
fonts[0].path; // "fonts/space-grotesk-latin-wght-normal.woff2"
```

`@omnypro/omnypotent/tokens.json` and `@omnypro/omnypotent/fonts.json` hold the
same data. Font paths are relative to the package's `dist` directory.

Space Grotesk and Space Mono ship in the package under the SIL Open Font
License. The license files are in `dist/fonts`.

## Develop

```sh
bun install
bun run build       # validate the Figma export and write dist/
bun run storybook   # the reference, on http://localhost:6006
bun test
```

## Update the colors from Figma

Figma owns the color ramps. Code never edits them.

1. In the Figma variables file, export the variables (the native export).
2. Replace `tokens/figma/variables.json` with the exported file, untouched.
3. Run `bun run build`. It validates the export first and fails with the path of
   any bad token.
4. Commit the new export.

Semantic tokens live in `tokens/semantic/dark.json` and type tokens in
`tokens/type/type.json`. Both are written by hand.

## Publishing

The package publishes to npm from `.github/workflows/publish.yml` when a tag
`v<version>` is pushed, where `<version>` matches `package.json`. The workflow
uses npm trusted publishing (OIDC), so no npm token is stored.

- npm trusted publishing needs npm 11.5.1 or later and Node 22.14.0 or later.
- The trusted publisher is configured per package on npmjs.com, under the
  package's Settings, Trusted publishing. The workflow filename is
  `publish.yml`.
- npm's documentation does not say whether the package must already exist
  before that configuration, so the first publish may need to be done by hand.
- A new trusted publisher configuration must complete its first successful
  publish within 2 days, or it expires.
