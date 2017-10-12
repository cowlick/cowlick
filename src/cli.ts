"use strict";
import * as fs from "fs";
import * as path from "path";
import * as commandpost from "commandpost";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));

interface RootOpts {
  base: string[];
}

const root = commandpost
  .create<RootOpts, {}>("cowlick")
  .version(packageJson.version, "-v, --version")
  .option("--base <path>", "alternative base path")
  .action(() => {
    process.stdout.write(root.helpText() + "\n");
  });

commandpost
  .exec(root, process.argv)
  .then(() => {
    process.stdout.write("");
    process.exit(0);
  }, err => {
    console.error("uncaught error", err);
    if (err.stack) {
      console.error(err.stack);
    }
    process.stdout.write("");
    process.exit(1);
  });