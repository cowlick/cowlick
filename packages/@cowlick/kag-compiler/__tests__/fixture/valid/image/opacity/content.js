var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "image",
        assetId: "test",
        layer: {
          name: "base",
          opacity: 1
        }
      }
    ])
  ]
});
