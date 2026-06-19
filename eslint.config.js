import pluginReactHooks from "eslint-plugin-react-hooks";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "react-hooks": pluginReactHooks
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "no-undef": "off",
      "no-unused-vars": "off"
    }
  }
];
