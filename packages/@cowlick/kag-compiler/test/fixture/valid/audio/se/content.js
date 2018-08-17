var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "playAudio",
        assetId: "test",
        group: "se"
      },
      {
        tag: "stopAudio",
        group: "se"
      }
    ])
  ]
});
