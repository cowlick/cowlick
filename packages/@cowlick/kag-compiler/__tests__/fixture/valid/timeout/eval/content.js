var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "timeout",
        milliseconds: 0,
        scripts: [
          {
            tag: "eval",
            path: "content_0_0_0"
          },
          {
            tag: "jump",
            label: "content"
          }
        ]
      }
    ])
  ]
});
