/**
 * Prettier: formats .astro and .vue files only.
 *
 * Everything else (TypeScript, JavaScript, CSS, JSON) is formatted by Biome;
 * the `lint` and `format` scripts pass Prettier the `**\/*.{astro,vue}` glob
 * explicitly. The options below mirror biome.jsonc so both tools produce the
 * same style. See docs/PLAN.md › change log for why two tools are used.
 *
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // Adds the Astro parser; Vue support is built into Prettier.
  plugins: ["prettier-plugin-astro"],
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  endOfLine: "lf",
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};

export default config;
