import { partition } from "lodash";
import fs from "node:fs";
import process from "node:process";
import { tsTransformIsort } from "./transformer";

//
// simple standalone cli
//
// usage:
//   node ./dist/typescript/cli.js $(git grep -l . '*.ts')
//

async function main() {
  const args = process.argv.slice(2);
  const [fixArgs, filePaths] = partition(args, (v) => v === "--fix");
  const fixMode = fixArgs.length > 0;

  const results = {
    ok: 0,
    nochange: 0,
    error: 0,
  };

  for (const filePath of filePaths) {
    try {
      const input = await fs.promises.readFile(filePath, "utf-8");
      const output = tsTransformIsort(input);
      if (output !== input) {
        if (fixMode) {
          await fs.promises.writeFile(filePath, output);
        }
        console.log("[OKK]", filePath);
        results.ok++;
      } else {
        console.log("[NOC]", filePath);
        results.nochange++;
      }
    } catch (e) {
      console.log("[ERR]", filePath);
      results.error++;
    }
  }

  if (fixMode) {
    if (results.error) {
      process.exit(1);
    }
  } else {
    if (results.ok || results.error) {
      process.exit(1);
    }
  }
}

main();
