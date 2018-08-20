var core = require("@cowlick/core");
module.exports = new core.Scene({
  label: "scene0",
  frames: [
    new core.Frame([
      {
        tag: "image",
        assetId: "black",
        layer: { name: "background" }
      },
      {
        tag: "text",
        clear: true,
        values: ["test"]
      }
    ])
  ]
});
