var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "jump",
          data: {
            label: "content"
          }
        },
        {
          tag: "jump",
          data: {
            label: "content",
            frame: 1
          }
        }
      ]),
      new core.Frame([
        {
          tag: "text",
          data: {
            values: ["テスト"]
          }
        }
      ])
    ]
  })
]);
