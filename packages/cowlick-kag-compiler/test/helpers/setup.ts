"use strict";
global.g = require("@akashic/akashic-engine");
import * as mock from "./mock";

const assets = {
  foo: {
    type: "image",
    path: "/path1.png",
    virtualPath: "path1.png",
    width: 1,
    height: 1
  }
};

(g.game as any) = new mock.Game({
  width: 320,
  height: 320,
  assets
});
