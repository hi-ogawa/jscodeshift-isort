import { tinyassert } from "@hiogawa/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/types";
import type {
  ImportDeclaration,
  Program,
  ProgramStatement,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import { sortBy } from "lodash";
import prettier from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { groupNeighborBy, options } from "./transform-isort";

// cf. https://github.com/prettier/prettier/blob/bc098779c4e457b1454895973196cffb3b1cdedf/src/language-js/parse/typescript.js

export function createPrettierParser(): prettier.Parser<unknown> {
  const original = parserTypescript.parsers.typescript;
  return {
    ...original,
    parse: (code, parsers, options) => {
      // AST from @typescript-eslint/typescript-estree (https://typescript-eslint.io/architecture/typescript-estree/)
      const ast: Program = original.parse(code, parsers, options);
      transformIsortPrettier(ast);
      return ast;
    },
  };
}

export function runPrettierFormat(
  code: string,
  options?: prettier.Options
): string {
  return prettier.format(code, {
    ...options,
    parser: createPrettierParser().parse,
  });
}

//
// direct port of src/transform-isort.ts
//

// mutate
function transformIsortPrettier(ast: Program) {
  // sort Program.body
  ast.body = sortStatements(ast.body);

  // sort ImportDeclaration.specifiers
  for (const stmt of ast.body) {
    if (stmt.type === AST_NODE_TYPES.ImportDeclaration) {
      sortImportSpecifiers(stmt);
    }
  }

  return;

  //
  // helpers
  //

  function sortStatements(statements: ProgramStatement[]): ProgramStatement[] {
    // TODO: how to get comment?
    const groups: [boolean, ProgramStatement[]][] = groupNeighborBy(
      statements,
      (stmt) => stmt.type === AST_NODE_TYPES.ImportDeclaration
    );

    for (const group of groups) {
      if (!group[0]) {
        continue;
      }
      group[1] = sortImportDeclarations(group[1] as ImportDeclaration[]);
    }

    return groups.map((group) => group[1]).flat();
  }

  function sortImportDeclarations(
    decls: ImportDeclaration[]
  ): ImportDeclaration[] {
    const declSources: [ImportDeclaration, string][] = decls.map((decl) => {
      return [decl, decl.source.value];
    });
    return sortBy(
      declSources,
      ([_, source]) => options.isortOrder.findIndex((re) => source.match(re)),
      ([_, source]) => source
    ).map(([decl]) => decl);
  }

  // mutate
  function sortImportSpecifiers(decl: ImportDeclaration) {
    if (!decl.specifiers) {
      return;
    }
    if (
      !decl.specifiers.every(
        (node) => node.type === AST_NODE_TYPES.ImportSpecifier
      )
    ) {
      return;
    }
    decl.specifiers = sortBy(decl.specifiers, (node) => {
      tinyassert(node.type === AST_NODE_TYPES.ImportSpecifier);
      return node.imported.name;
    });
  }
}
