import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn", // Change to "off" to disable the rule completely
        {
          argsIgnorePattern: "^_", // Ignores variables starting with _
          varsIgnorePattern: "^_", // Ignores all unused vars starting with _
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
