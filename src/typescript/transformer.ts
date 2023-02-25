import { tinyassert } from "@hiogawa/utils";
import { sortBy, zip } from "lodash";
import ts from "typescript";
import { DEFAULT_OPTIONS, groupNeighborBy } from "../transform-isort";

// TODO: sortImportSpecifiers

const IGNORE_COMMENTS = ["isort-ignore"];

// minimum parse data to allow sorting afterward
interface ImportDeclarationInfo {
  fullStart: number;
  start: number;
  end: number;
  source: string;
  specifiers?: ImportSpecifierInfo[];
}

interface ImportSpecifierInfo {
  fullStart: number;
  start: number;
  end: number;
  name: string;
  imported?: string;
}

// cf. https://gist.github.com/hi-ogawa/cb338b4765d25321b120b2a47819abcc
class TransformerWrapper {
  result: ImportDeclarationInfo[][] = [];

  getTransformer =
    (): ts.TransformerFactory<ts.SourceFile> =>
    (_ctx: ts.TransformationContext) =>
    (sourceFile: ts.SourceFile) => {
      // we don't have to visit all AST recursively
      this.result = extraceImportDeclaration(sourceFile);
      return sourceFile;
    };
}

function extraceImportDeclaration(
  node: ts.SourceFile
): ImportDeclarationInfo[][] {
  const groups: [boolean, ts.Statement[]][] = groupNeighborBy(
    [...node.statements],
    (stmt) =>
      ts.isImportDeclaration(stmt) &&
      !IGNORE_COMMENTS.some((comment) => getTrivia(stmt).includes(comment))
  );
  const result: ImportDeclarationInfo[][] = [];
  for (const [ok, statements] of groups) {
    if (!ok) {
      continue;
    }
    const resultGroup = statements.map((node) => {
      tinyassert(ts.isImportDeclaration(node));
      tinyassert(ts.isStringLiteral(node.moduleSpecifier));
      const info: ImportDeclarationInfo = {
        fullStart: node.getFullStart(),
        start: node.getStart(),
        end: node.end,
        source: node.moduleSpecifier.text,
        specifiers: extraceImportSpecifier(node),
      };
      return info;
    });
    result.push(resultGroup);
  }
  return result;
}

function extraceImportSpecifier(
  node: ts.ImportDeclaration
): ImportSpecifierInfo[] | undefined {
  const namedImports = node.importClause?.namedBindings;
  if (namedImports && ts.isNamedImports(namedImports)) {
    return namedImports.elements.map((node) => ({
      fullStart: node.getFullStart(),
      start: node.getStart(),
      end: node.end,
      name: node.name.text,
      imported: node.propertyName?.text,
    }));
  }
  return;
}

function getTrivia(node: ts.Node): string {
  return node.getFullText().slice(0, node.getLeadingTriviaWidth());
}

//
// ts transformer driver
//

export function tsAnalyze(code: string) {
  const wrapper = new TransformerWrapper();
  ts.transpileModule(code, {
    compilerOptions: {},
    // TODO: tsx mode?
    fileName: "__dummy.tsx",
    reportDiagnostics: false,
    transformers: {
      before: [wrapper.getTransformer()],
    },
  });
  return wrapper.result;
}

//
// codemod
//

export function tsTransformIsort(code: string): string {
  const groups = tsAnalyze(code);
  for (const group of groups) {
    code = sortImportDeclarations(code, group);
  }
  return code;
}

function sortImportDeclarations(
  code: string,
  decls: ImportDeclarationInfo[]
): string {
  const start = decls[0]?.fullStart;
  const end = decls.at(-1)?.end;
  tinyassert(typeof start === "number");
  tinyassert(typeof end === "number");

  const sorted = sortBy(
    decls,
    (decl) =>
      DEFAULT_OPTIONS.isortOrder.findIndex((re) => decl.source.match(re)),
    (decl) =>
      DEFAULT_OPTIONS.isortCaseInsensitive
        ? decl.source.toLowerCase()
        : decl.source
  );

  // keep existing trivia fixed (this is probably the easiest way to handle new lines naturally)
  // e.g.
  //  (trivia y)     (trivia y)
  //  (import y)  ⇒  (import x)
  //  (trivia x)     (trivia x)
  //  (import x)     (import y)

  const triviaRanges = decls.map((decl) => [decl.fullStart, decl.start]);
  const importRanges = sorted.map((decl) => [decl.start, decl.end]);
  const allRanges = zip(triviaRanges, importRanges).flat(1) as [
    number,
    number
  ][];

  const result = [[0, start], ...allRanges, [end, code.length]]
    .map((range) => code.slice(...range))
    .join("");
  return result;
}
