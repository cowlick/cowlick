var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "condition",
        path: "content_0_0",
        scripts: [
          {
            tag: "eval",
            path: "content_0_0_0"
          }
        ]
      }
    ])
  ]
});
