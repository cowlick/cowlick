var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "playAudio",
        data: {
          assetId: "test",
          group: "bgm"
        }
      },
      {
        tag: "stopAudio",
        data: {
          assetId: null,
          group: "bgm"
        }
      }
    ])
  ]
});
