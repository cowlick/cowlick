"use strict";
import * as assert from "assert";
import * as kag from "../resources/kag";

function appendSyntaxErrorinfo(e: any) {
  "use strict";

  if (e instanceof kag.SyntaxError) {
    const se: kag.SyntaxError = e;
    const info = "raised: offset = " + se.offset + ", line = " + se.line + ", column = " + se.column;
    se.message = info + ". " + se.message;
  }
}

describe("KAGParser", () => {

  let fs = require("fs");
  let glob = require("glob");
  describe("正しい構文が処理できる", () => {
    const path = "test/fixture/kag/valid/";

    let files = glob.sync(`${path}**/*.ks`);

    files
      .forEach((filePath: string) => {
        const baseName = filePath
          .substr(0, filePath.length - "/content.ks".length)
          .substr(path.length);
        const astFilePath = `${path}${baseName}/expected.ast`;
        it(`${filePath}`, () => {
          const text = fs.readFileSync(filePath, "utf8");
          try {
            const actual = kag.parse(text);
            const expectedAST = fs.readFileSync(astFilePath, "utf8");
            assert.deepEqual(actual, JSON.parse(expectedAST));
          } catch(e) {
            appendSyntaxErrorinfo(e);
            throw e;
          }
        });
      });
  });
});
