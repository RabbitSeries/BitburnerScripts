import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ignores: [
      "node_modules/**",
      "dist/**",
      "bitburner-filesync/**/*",
      "NetscriptDefinitions.d.ts"],
    plugins: { js },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: "latest", globals: globals.browser },
  },
  // Somehow "eslint-plugin-react".configs.flat.recommended and tseslint.configs.recommended will ignore my ignores defined above
  reactRefresh.configs.recommended,
  reactHooks.configs['recommended-latest']
])
