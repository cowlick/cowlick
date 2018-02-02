"use strict";
import * as fs from "fs";
import * as path from "path";
import * as commandpost from "commandpost";
import * as escodegen from "escodegen";
import * as analyzer from "cowlick-analyzer";
import {parse} from "./parser";
import {SyntaxError} from "../resources/kag";
import {runProgress} from "./runner";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));

interface CompileOpts {
  output: string[];
}

interface CompileArgs {
  inputDir: string;
}

const root = commandpost
  .create<CompileOpts, CompileArgs>("cowlick-kag-compiler [inputDir]")
  .version(packageJson.version, "-v, --version")
  .description("compile KAG scenario")
  .option("-o, --output <output>", "output dir")
  .action(async (opts, args) => {
    const output: string = opts.output[0] || "script";
    const outputPath = path.resolve(process.cwd(), output);
    const basePath = path.resolve(process.cwd(), args.inputDir);
    const ast = await parse(basePath, runProgress);
    const result = await runProgress("Analyzing scenario", async () => analyzer.analyze(ast));
    const exists = await analyzer.exists(outputPath);
    if (exists === false) {
      await analyzer.mkdir(outputPath);
    }
    const outputFile = path.join(outputPath, "scenario.js");
    await runProgress(`Generate ${outputFile}`, async () => analyzer.generate(outputFile, result.scenario));
    for (const s of result.scripts) {
      await s.write(outputPath);
    }
  });

commandpost.exec(root, process.argv).then(
  () => {
    process.stdout.write("");
    process.exit(0);
  },
  err => {
    if (err instanceof SyntaxError) {
      console.error(err.message);
      console.error(err.location);
    } else {
      console.error("uncaught error", err);
    }
    process.exit(1);
  }
);
