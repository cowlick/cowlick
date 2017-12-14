var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "realTimeDisplay",
          data: {
            enabled: false
          }
        }
      ])
    ]
  })
]);
