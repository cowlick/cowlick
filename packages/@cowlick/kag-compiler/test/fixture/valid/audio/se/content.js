var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "playAudio",
        data: {
          assetId: "test",
          group: "se"
        }
      },
      {
        tag: "stopAudio",
        data: {
          assetId: null,
          group: "se"
        }
      }
    ])
  ]
});
