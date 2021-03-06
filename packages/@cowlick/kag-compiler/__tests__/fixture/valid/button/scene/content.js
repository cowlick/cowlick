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
            name: "choice",
            x: 0,
            y: 0
          }
        },
        scripts: [
          {
            tag: "jump",
            label: "content"
          }
        ]
      },
      {
        tag: "button",
        image: {
          assetId: "test",
          layer: {
            name: "choice",
            x: 0,
            y: 0
          }
        },
        scripts: [
          {
            tag: "jump",
            label: "content",
            frame: 0
          }
        ]
      }
    ])
  ]
});
