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
  config: string[];
}

interface CompileArgs {
  sources: string[];
}

interface Config {
  outdir: string;
  plugins: string[];
  sources: string[];
}

const root = commandpost
  .create<CompileOpts, CompileArgs>("cowlick-kag-compiler [sources...]")
  .version(packageJson.version, "-v, --version")
  .description("compile KAG scenario")
  .option("-o, --outdir <outdir>", "output dir")
  .option("-p, --plugin <path>", "plugin path")
  .option("-c, --config <path>", "config JSON file path for cowlick KAG compiler")
  .action(async (opts, args) => {
    const config: Config = {
      outdir: "script",
      plugins: [],
      sources: []
    };
    const cwd = process.cwd();
    if (opts.config && opts.config[0]) {
      const configJson = JSON.parse(fs.readFileSync(path.resolve(cwd, opts.config[0]), "utf8"));
      if ("outdir" in configJson) {
        config.outdir = configJson.outdir;
      }
      if ("plugins" in configJson) {
        config.plugins.push(...configJson.plugins);
      }
      if ("sources" in configJson) {
        config.sources.push(...configJson.sources);
      }
    } else {
      if (opts.outdir && opts.outdir[0]) {
        config.outdir = opts.outdir[0];
      }
      if (opts.plugin) {
        config.plugins.push(...opts.plugin);
      }
      if (args.sources && args.sources.length > 0) {
        config.sources.push(...args.sources);
      } else {
        console.log("`sources` more than one argument");
        process.exit(1);
      }
    }
    const outputPath = path.resolve(cwd, config.outdir);
    try {
      await analyzer.mkdir(outputPath);
    } catch (e) {
      console.log("output directory already exists: " + outputPath);
    }
    for (const source of config.sources) {
      const target = path.resolve(cwd, source);
      const plugins = config.plugins.map(p => new analyzer.Plugin(path.resolve(cwd, p)));
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
