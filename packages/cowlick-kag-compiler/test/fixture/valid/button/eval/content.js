var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "button",
          data: {
            image: {
              assetId: "test",
              layer: {
                name: "choice"
              }
            },
            x: 0,
            y: 0,
            scripts: [
              {
                tag: "eval",
                data: {
                  path: "content_0_0_0"
                }
              },
              {
                tag: "jump",
                data: {
                  label: "content"
                }
              }
            ]
          }
        }
      ])
    ]
  })
]);