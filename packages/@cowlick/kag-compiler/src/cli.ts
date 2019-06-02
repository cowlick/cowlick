import * as fs from "fs";
import * as path from "path";
import * as commandpost from "commandpost";
import * as analyzer from "@cowlick/analyzer";
import {parse} from "./parser";
import {SyntaxError} from "../resources/kag";
import {runProgress} from "./runner";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));

interface CompileOpts {
  outdir: string[];
  plugin: string[];
}

interface CompileArgs {
  sources: string[];
}

const root = commandpost
  .create<CompileOpts, CompileArgs>("cowlick-kag-compiler <sources...>")
  .version(packageJson.version, "-v, --version")
  .description("compile KAG scenario")
  .option("-o, --outdir <outdir>", "output dir")
  .option("-p, --plugin <path>", "plugin path")
  .action(async (opts, args) => {
    const outdir: string = opts.outdir[0] || "script";
    const cwd = process.cwd();
    const outputPath = path.resolve(cwd, outdir);
    try {
      await analyzer.mkdir(outputPath);
    } catch (e) {
      console.log("output directory already exists: " + outputPath);
    }
    for (const source of args.sources) {
      const target = path.resolve(cwd, source);
      const plugins = (opts.plugin ? opts.plugin : []).map(p => new analyzer.Plugin(path.resolve(cwd, p)));
      const ast = await parse(target, runProgress);
      const result = await runProgress("Analyzing scenario", async () => await analyzer.analyze(ast, plugins));
      await runProgress(`Generate scenario`, async () => analyzer.generate(outputPath, result.scenario));
      for (const s of result.scripts) {
        await s.write(outputPath);
      }
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
