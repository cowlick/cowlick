var core = require("@cowlick/core");
module.exports = new core.Scene({
  label: "scene0",
  frames: [
    new core.Frame([
      {
        tag: "text",
        clear: true,
        values: ["test"]
      }
    ])
  ]
});
