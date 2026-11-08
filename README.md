# @omnypro/omnypotent

The Omnyist Productions brand. Colors and type are here, with a Storybook page that shows them. No components yet. Dark only for now.

## Install

```sh
npm install @omnypro/omnypotent
```

## Use

Import the CSS through your bundler:

```css
@import "@omnypro/omnypotent/tokens.css";
@import "@omnypro/omnypotent/fonts.css";
```

`tokens.css` puts custom properties on `:root`. The colors are `--color-*`, and the type tokens are `--font-family-*` and `--font-size-*`. Each semantic color, such as `--color-surface`, is a `var()` reference to a color in the Figma ramps.

Some programs have no access to CSS variables, such as the program that renders our OG images. Use the plain values in those:

```ts
import { tokens, fonts } from "@omnypro/omnypotent";

tokens.color.surface; // "#0E0F16"
fonts[0].path; // "fonts/space-grotesk-latin-wght-normal.woff2"
```

You can also import `@omnypro/omnypotent/tokens.json` and `@omnypro/omnypotent/fonts.json`. The same data is in both. Font paths are relative to the package's `dist` folder.

You get Space Grotesk and Space Mono with the package, each in the latin, latin-ext, and vietnamese subsets. Every `@font-face` has a `unicode-range`, so a browser downloads a subset only when a page uses its characters. Both families are under the SIL Open Font License, and the license files are in `dist/fonts`.

## Develop

```sh
bun install
bun run build       # validate the Figma export and write dist/
bun run storybook   # the reference, on http://localhost:6006
bun test
```

## Import the colors into Sketch

Sketch can't read the Figma export. The [figma-to-sketch](https://github.com/omnypro/figma-to-sketch) plugin adds colors to a document as Color Variables.

1. Run `bun run sketch`. It writes `sketch/omnypotent.tokens.json`, which holds the Figma ramps and the semantic colors.
2. Open a Sketch document and choose Plugins → Figma to Sketch → Import Figma Colors.
3. Pick `sketch/omnypotent.tokens.json`.

The semantic colors arrive as `semantic/surface`, `semantic/text`, and so on. Each holds the color that it resolves to. Run the steps again after a change, and the plugin updates the variables that already exist.

## Update the colors from Figma

Figma owns the color ramps. Code never edits them.

1. Export the variables from the Figma variables file. Use the native export.
2. Replace `tokens/figma/variables.json` with the exported file.
3. Run `bun run build`. If a token is bad, you get an error with its path, and the build stops.
4. Commit the new export.

Edit the semantic tokens by hand in `tokens/semantic/dark.json`. Do the same for the type tokens in `tokens/type/type.json`.

## Publishing

Push a tag named `v<version>` to publish to npm, where `<version>` matches `package.json`. The workflow is `.github/workflows/publish.yml`. Publishing goes through npm trusted publishing (OIDC), so you store no npm token anywhere.

- To use trusted publishing, run npm 11.5.1 or later on Node 22.14.0 or later.
- Set up the trusted publisher on npmjs.com, per package, under the package's Settings and then Trusted publishing. Enter `publish.yml` as the workflow filename.
- Check the npm documentation on whether the package must exist before you set this up. You may have to publish the first version by hand.
- A trusted publisher that you add on npmjs.com expires unless its first publish succeeds within 2 days.

## License

MIT. The fonts keep their own licenses, which are in `dist/fonts`.
