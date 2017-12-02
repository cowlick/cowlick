var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "condition",
          data: {
            path: "content_0_0",
            scripts: [
              {
                tag: "eval",
                data: {
                  path: "content_0_0_0"
                }
              }
            ]
          }
        }
      ])
    ]
  })
]);