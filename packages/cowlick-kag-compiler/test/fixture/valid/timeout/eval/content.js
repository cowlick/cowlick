var core = require("cowlick-core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "timeout",
        data: {
          milliseconds: 0,
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
});
