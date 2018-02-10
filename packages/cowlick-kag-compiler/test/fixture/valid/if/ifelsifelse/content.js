var core = require("cowlick-core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "ifElse",
        data: {
          conditions: [
            {
              path: "content_0_0_0",
              scripts: [
                {
                  tag: "image",
                  data: {
                    assetId: "test",
                    layer: {
                      name: "base"
                    }
                  }
                }
              ]
            },
            {
              path: "content_0_0_1",
              scripts: [
                {
                  tag: "image",
                  data: {
                    assetId: "test",
                    layer: {
                      name: "base"
                    }
                  }
                }
              ]
            }
          ],
          elseBody: [
            {
              tag: "image",
              data: {
                assetId: "test",
                layer: {
                  name: "base"
                }
              }
            }
          ]
        }
      }
    ])
  ]
});
