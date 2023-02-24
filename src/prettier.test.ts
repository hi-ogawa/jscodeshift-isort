import { describe, expect, it } from "vitest";
import { runPrettierFormat } from "./prettier";

describe("prettier", () => {
  it("basic", () => {
    // example from https://github.com/hi-ogawa/web-ext-tab-manager/pull/15
    const input = `\
import browser from "webextension-polyfill";
import type { Endpoint } from "comlink";
import { tinyassert, DefaultMap } from "@hiogawa/utils";
import * as comlink from "comlink";
import * as superjson from "superjson";
import { sleep, generateId } from "./misc";
import EventEmitter from "eventemitter3";
import { logger } from "./logger";

export function createComlinkEndpoint(port: browser.Runtime.Port): Endpoint {}
`;
    const output = runPrettierFormat(input);
    expect(output).toMatchInlineSnapshot(`
      "import { DefaultMap, tinyassert } from \\"@hiogawa/utils\\";
      import type { Endpoint } from \\"comlink\\";
      import * as comlink from \\"comlink\\";
      import EventEmitter from \\"eventemitter3\\";
      import * as superjson from \\"superjson\\";
      import browser from \\"webextension-polyfill\\";
      import { logger } from \\"./logger\\";

      import { generateId, sleep } from \\"./misc\\";
      export function createComlinkEndpoint(port: browser.Runtime.Port): Endpoint {}
      "
    `);
  });

  it("comment", () => {
    const input = `\
import { y, x } from "c";
import { y, x } from "b";
// prettier-ignore
import { y, x } from "a";
import { y, x } from "c";
import { y, x } from "b";
`;
    const output = runPrettierFormat(input);
    expect(output).toMatchInlineSnapshot(`
      "import { x, y } from \\"b\\";
      import { x, y } from \\"c\\";
      // prettier-ignore
      import { y, x } from \\"a\\";
      import { x, y } from \\"b\\";
      import { x, y } from \\"c\\";
      "
    `);
  });
});
