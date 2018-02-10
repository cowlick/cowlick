var core = require("cowlick-core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "font",
        data: {
          size: 18,
          color: "0xffffff"
        }
      },
      {
        tag: "font",
        data: {
          size: "default",
          color: "default"
        }
      },
      {
        tag: "font",
        data: {
          size: 18
        }
      },
      {
        tag: "font",
        data: {
          color: "0xffffff"
        }
      }
    ])
  ]
});
