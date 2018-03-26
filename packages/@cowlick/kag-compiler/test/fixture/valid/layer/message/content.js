var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "layerConfig",
        data: {
          name: "message",
          visible: false
        }
      },
      {
        tag: "click",
        data: [
          {
            tag: "layerConfig",
            data: {
              name: "message",
              visible: true
            }
          }
        ]
      }
    ])
  ]
});
