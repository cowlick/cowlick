var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "image",
          data: {
            assetId: "test",
            layer: {
              name: "base",
              x: 0,
              y: 0
            }
          }
        }
      ])
    ]
  })
]);
