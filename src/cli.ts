import { run } from "jscodeshift/src/Runner";
import path from "node:path";
import process from "node:process";

async function main() {
  let args = process.argv.slice(2);
  let fixMode = false;
  if (args.some((v) => v === "--fix")) {
    fixMode = true;
    args = args.filter((v) => v !== "--fix");
  }
  const transformPath = path.join(__dirname, "index.js");
  const results = await run(transformPath, args, {
    parser: "tsx",
    dry: !fixMode,
    verbose: 2, // show status for each file (error, modified, etc...)
  });
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
