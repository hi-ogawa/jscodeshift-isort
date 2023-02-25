import type prettier from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { tsTransformIsort } from "./transformer";

// usage:
//   npx prettier --write . --plugin=./dist/typescript/prettier-plugin.js

const plugin: prettier.Plugin = {
  parsers: {
    typescript: {
      ...parserTypescript.parsers.typescript,
      preprocess: tsTransformIsort,
    },
  },
};

module.exports = plugin;
