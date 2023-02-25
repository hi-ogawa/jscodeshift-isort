import { describe, expect, it } from "vitest";
import { tsAnalyze, tsTransformIsort } from "./transformer";

describe("ts-transfomer", () => {
  it("basic", () => {
    const input = `\
import { x, y } from "b";
import "c";
import { z, w } from "a";
`;
    expect(tsTransformIsort(input)).toMatchInlineSnapshot(`
      "import { z, w } from \\"a\\";
      import { x, y } from \\"b\\";
      import \\"c\\";
      "
    `);
    expect(tsAnalyze(input)).toMatchInlineSnapshot(`
      [
        [
          {
            "end": 25,
            "fullStart": 0,
            "source": "b",
            "specifiers": [
              {
                "end": 10,
                "fullStart": 8,
                "imported": undefined,
                "name": "x",
                "start": 9,
              },
              {
                "end": 13,
                "fullStart": 11,
                "imported": undefined,
                "name": "y",
                "start": 12,
              },
            ],
            "start": 0,
          },
          {
            "end": 37,
            "fullStart": 25,
            "source": "c",
            "specifiers": undefined,
            "start": 26,
          },
          {
            "end": 63,
            "fullStart": 37,
            "source": "a",
            "specifiers": [
              {
                "end": 48,
                "fullStart": 46,
                "imported": undefined,
                "name": "z",
                "start": 47,
              },
              {
                "end": 51,
                "fullStart": 49,
                "imported": undefined,
                "name": "w",
                "start": 50,
              },
            ],
            "start": 38,
          },
        ],
      ]
    `);
  });

  it("comment", () => {
    const input = `\
// hey
import { x, y } from "b";
import "c"; // xxx
// foo
import { z, w } from "a";
`;
    expect(tsTransformIsort(input)).toMatchInlineSnapshot(`
      "// hey
      import { z, w } from \\"a\\";
      import { x, y } from \\"b\\"; // xxx
      // foo
      import \\"c\\";
      "
    `);
    expect(tsAnalyze(input)).toMatchInlineSnapshot(`
      [
        [
          {
            "end": 32,
            "fullStart": 0,
            "source": "b",
            "specifiers": [
              {
                "end": 17,
                "fullStart": 15,
                "imported": undefined,
                "name": "x",
                "start": 16,
              },
              {
                "end": 20,
                "fullStart": 18,
                "imported": undefined,
                "name": "y",
                "start": 19,
              },
            ],
            "start": 7,
          },
          {
            "end": 44,
            "fullStart": 32,
            "source": "c",
            "specifiers": undefined,
            "start": 33,
          },
          {
            "end": 84,
            "fullStart": 44,
            "source": "a",
            "specifiers": [
              {
                "end": 69,
                "fullStart": 67,
                "imported": undefined,
                "name": "z",
                "start": 68,
              },
              {
                "end": 72,
                "fullStart": 70,
                "imported": undefined,
                "name": "w",
                "start": 71,
              },
            ],
            "start": 59,
          },
        ],
      ]
    `);
  });

  it("ignore", () => {
    const input = `\
import { x, y } from "b";
// isort-ignore
import "c";
import { z, w } from "a";
`;
    expect(tsTransformIsort(input)).toMatchInlineSnapshot(`
      "import { x, y } from \\"b\\";
      // isort-ignore
      import \\"c\\";
      import { z, w } from \\"a\\";
      "
    `);
    expect(tsAnalyze(input)).toMatchInlineSnapshot(`
      [
        [
          {
            "end": 25,
            "fullStart": 0,
            "source": "b",
            "specifiers": [
              {
                "end": 10,
                "fullStart": 8,
                "imported": undefined,
                "name": "x",
                "start": 9,
              },
              {
                "end": 13,
                "fullStart": 11,
                "imported": undefined,
                "name": "y",
                "start": 12,
              },
            ],
            "start": 0,
          },
        ],
        [
          {
            "end": 79,
            "fullStart": 53,
            "source": "a",
            "specifiers": [
              {
                "end": 64,
                "fullStart": 62,
                "imported": undefined,
                "name": "z",
                "start": 63,
              },
              {
                "end": 67,
                "fullStart": 65,
                "imported": undefined,
                "name": "w",
                "start": 66,
              },
            ],
            "start": 54,
          },
        ],
      ]
    `);
  });

  it("multiple groups", () => {
    const input = `\
import { x, y } from "b";
"hello";
import "c";
import { z, w } from "a";
`;
    expect(tsTransformIsort(input)).toMatchInlineSnapshot(`
      "import { x, y } from \\"b\\";
      \\"hello\\";
      import { z, w } from \\"a\\";
      import \\"c\\";
      "
    `);
    expect(tsAnalyze(input)).toMatchInlineSnapshot(`
      [
        [
          {
            "end": 25,
            "fullStart": 0,
            "source": "b",
            "specifiers": [
              {
                "end": 10,
                "fullStart": 8,
                "imported": undefined,
                "name": "x",
                "start": 9,
              },
              {
                "end": 13,
                "fullStart": 11,
                "imported": undefined,
                "name": "y",
                "start": 12,
              },
            ],
            "start": 0,
          },
        ],
        [
          {
            "end": 46,
            "fullStart": 34,
            "source": "c",
            "specifiers": undefined,
            "start": 35,
          },
          {
            "end": 72,
            "fullStart": 46,
            "source": "a",
            "specifiers": [
              {
                "end": 57,
                "fullStart": 55,
                "imported": undefined,
                "name": "z",
                "start": 56,
              },
              {
                "end": 60,
                "fullStart": 58,
                "imported": undefined,
                "name": "w",
                "start": 59,
              },
            ],
            "start": 47,
          },
        ],
      ]
    `);
  });

  it("tsx", () => {
    const input = `\
import "b";
import "a";

<input />
`;
    expect(tsTransformIsort(input)).toMatchInlineSnapshot(`
      "import \\"a\\";
      import \\"b\\";

      <input />
      "
    `);
    expect(tsAnalyze(input)).toMatchInlineSnapshot(`
      [
        [
          {
            "end": 11,
            "fullStart": 0,
            "source": "b",
            "specifiers": undefined,
            "start": 0,
          },
          {
            "end": 23,
            "fullStart": 11,
            "source": "a",
            "specifiers": undefined,
            "start": 12,
          },
        ],
      ]
    `);
  });
});
