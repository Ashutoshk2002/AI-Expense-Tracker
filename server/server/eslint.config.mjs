import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/", "node_modules/"],
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.node } },
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // Allow unused variables starting with "_"
      "no-console": "warn", // Warn on console statements
      semi: ["error", "always"], // Enforce semicolons
      quotes: ["error", "double"], // Enforce double quotes
      eqeqeq: ["error", "always"], // Enforce strict equality
      "no-var": "error", // Disallow var in favor of let/const
      "prefer-const": "error", // Suggest using const where possible,
    },
  },
  pluginJs.configs.recommended,
];
