var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "click",
        data: [
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
    ])
  ]
});
