var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "text",
        values: ["テスト"]
      }
    ]),
    new core.Frame([
      {
        tag: "text",
        values: ["\n1"]
      }
    ])
  ]
});
