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
            tag: "jump",
            label: "content",
            frame: 0
          }
        ]
      }
    ])
  ]
});
