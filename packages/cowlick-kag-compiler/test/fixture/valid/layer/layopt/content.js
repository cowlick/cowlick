var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "layerConfig",
          data: {
            name: "test",
            x: 0,
            y: 0,
            opacity: 0,
            visible: true
          }
        }
      ])
    ]
  })
]);