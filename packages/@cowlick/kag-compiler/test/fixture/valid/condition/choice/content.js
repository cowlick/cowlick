var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "choice",
        data: {
          layer: {
            name: "choice"
          },
          values: [
            {
              tag: "jump",
              data: {
                label: "content",
                frame: 0
              },
              text: "test1",
              path: "content_0_0_0"
            },
            {
              tag: "jump",
              data: {
                label: "content",
                frame: 0
              },
              text: "test2"
            }
          ]
        }
      }
    ])
  ]
});
