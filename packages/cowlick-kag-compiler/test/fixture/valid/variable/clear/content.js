var core = require("cowlick-core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "clearSystemVariables",
        data: {}
      },
      {
        tag: "clearCurrentVariables",
        data: {}
      }
    ])
  ]
});
