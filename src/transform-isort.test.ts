import { applyTransform } from "jscodeshift/src/testUtils";
import { describe, expect, it } from "vitest";
import { transformIsort } from "./transform-isort";

function transformWrapper(input: string): string {
  const output = applyTransform(
    transformIsort,
    {},
    { source: input },
    { parser: "tsx" }
  );
  return output;
}

describe("transformIsort", () => {
  it("prettier-ignore", () => {
    const input = `\
import { y0, x0 } from "e";
import { y1, x1 } from "d";
// prettier-ignore
import { y2, x2 } from "a";
import { y3, x3 } from "c";
import { y4, type x4 } from "b";
`;
    const output = transformWrapper(input);
    expect(output).toMatchInlineSnapshot(`
      "import { x1, y1 } from \\"d\\";
      import { x0, y0 } from \\"e\\";
      // prettier-ignore
      import { x2, y2 } from \\"a\\";
      import { type x4, y4 } from \\"b\\";
      import { x3, y3 } from \\"c\\";"
    `);
  });

  describe("syntax", () => {
    it("satisfies", () => {
      const input = `\
import { y, x } from "b";
import "a";

const x = { k: 0 } satisfies Record<string, number>;
`;
      expect(() => {
        const output = transformWrapper(input);
        expect(output).toMatchInlineSnapshot();
      }).toThrowErrorMatchingInlineSnapshot(
        '"did not recognize object of type \\"TSSatisfiesExpression\\""'
      );
    });
  });
});
