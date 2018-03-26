var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "choice",
        layer: {
          name: "choice"
        },
        values: [
          {
            tag: "jump",
            label: "content",
            text: "test1",
            frame: 0
          },
          {
            tag: "jump",
            label: "content",
            text: "test2",
            frame: 1
          }
        ]
      },
      {
        tag: "trigger",
        value: 1
      }
    ]),
    new core.Frame([
      {
        tag: "text",
        values: ["テスト2"]
      }
    ])
  ]
});
