"use strict";
import * as assert from "assert";
import * as fs from "fs";
import * as glob from "glob";
import * as esprima from "esprima";
import {Scenario, analyze} from "@cowlick/analyzer";

describe("Analyzer", () => {
  describe("スクリプト ASTをJavaScript ASTに変換できる", () => {
    const path = "test/fixture/valid/";

    let files = glob.sync(`${path}**/content.js`);

    files.forEach((filePath: string) => {
      const baseName = filePath.substr(0, filePath.length - "/content.js".length).substr(path.length);
      const astFilePath = `${path}${baseName}/content.ast`;
      it(`${astFilePath}`, () => {
        const scriptAst: Scenario = [
          {
            label: "content",
            frames: JSON.parse(fs.readFileSync(astFilePath, "utf8"))
          }
        ];
        const actual = analyze(scriptAst);
        // FIXME: start, endを外してacornでテストできるようにしたい
        const expectedAST = [
          {
            label: "content",
            source: esprima.parseModule(fs.readFileSync(filePath, "utf8"))
          }
        ];
        assert.deepEqual(actual.scenario, expectedAST);

        for (const script of actual.scripts) {
          const expectedScript = esprima.parseModule(fs.readFileSync(`${path}${baseName}/${script.name}`, "utf8"));
          assert.deepEqual(script.source, expectedScript);
        }
      });
    });
  });
});
