var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "fadeIn",
          data: {
            layer: "test",
            duration: 10
          }
        },
        {
          tag: "click",
          data: [
            {
              tag: "skip",
              data: {}
            }
          ]
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
