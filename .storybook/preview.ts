import type { Preview } from "@storybook/html-vite";
import "../dist/tokens.css";
import "../dist/fonts.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
  },
};

export default preview;
