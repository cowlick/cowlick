var core = require("cowlick-core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "click",
        data: [
          {
            tag: "jump",
            data: {
              label: "content"
            }
          }
        ]
      },
      {
        tag: "click",
        data: [
          {
            tag: "jump",
            data: {
              label: "content",
              frame: 0
            }
          }
        ]
      }
    ])
  ]
});
