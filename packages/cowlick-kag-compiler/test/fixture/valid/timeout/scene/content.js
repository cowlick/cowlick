var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "timeout",
          data: {
            milliseconds: 0,
            scripts: [
              {
                tag: "jump",
                data: {
                  label: "content"
                }
              }
            ]
          }
        },
        {
          tag: "timeout",
          data: {
            milliseconds: 0,
            scripts: [
              {
                tag: "jump",
                data: {
                  label: "content",
                  frame: 0
                }
              }
            ]
          }
        }
      ])
    ]
  })
]);
