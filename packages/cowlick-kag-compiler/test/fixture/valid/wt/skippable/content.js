var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "waitTransition",
          data: {
            scripts: [
              {
                tag: "fadeIn",
                data: {
                  layer: "test",
                  duration: 10
                }
              }
            ],
            skippable: false
          }
        }
      ]),
      new core.Frame([
        {
          tag: "text",
          data: {
            values: [
              "テスト"
            ]
          }
        }
      ])
    ]
  })
]);