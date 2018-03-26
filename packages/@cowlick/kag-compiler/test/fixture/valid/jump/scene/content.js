var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "jump",
        label: "content"
      },
      {
        tag: "jump",
        label: "content",
        frame: 1
      }
    ]),
    new core.Frame([
      {
        tag: "text",
        values: ["テスト"]
      }
    ])
  ]
});
