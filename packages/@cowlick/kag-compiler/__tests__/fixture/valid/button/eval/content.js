var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "button",
        image: {
          assetId: "test",
          layer: {
            name: "choice"
          }
        },
        x: 0,
        y: 0,
        scripts: [
          {
            tag: "eval",
            path: "content_0_0_0"
          },
          {
            tag: "jump",
            label: "content"
          }
        ]
      }
    ])
  ]
});
