var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "layer",
        name: "message",
        visible: false
      },
      {
        tag: "click",
        scripts: [
          {
            tag: "layer",
            name: "message",
            visible: true
          }
        ]
      }
    ])
  ]
});
