import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Capas MVC: cada una solo habla con la de abajo.
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/db", "@/db/*", "@/models/*", "drizzle-orm", "drizzle-orm/*", "mysql2", "mysql2/*"], message: "Vista: no accede a datos. Usa un controlador de src/controllers." }] }],
    },
  },
  {
    files: ["src/controllers/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/db", "@/db/*", "drizzle-orm", "drizzle-orm/*", "mysql2", "mysql2/*"], message: "Controlador: no hace consultas. Usa un modelo de src/models." }] }],
    },
  },
  {
    files: ["src/models/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["next/*", "react", "@/controllers/*", "@/app/*", "@/components/*"], message: "Modelo: solo datos. No depende de vistas, controladores ni Next." }] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
