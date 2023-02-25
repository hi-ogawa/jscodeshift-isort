import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts", "src/typescript/prettier-plugin.ts"],
  format: ["cjs"],
  splitting: false,
  sourcemap: "inline",
});
