var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "font",
        size: 18,
        color: "0xffffff"
      },
      {
        tag: "font",
        size: "default",
        color: "default"
      },
      {
        tag: "font",
        size: 18
      },
      {
        tag: "font",
        color: "0xffffff"
      }
    ])
  ]
});
