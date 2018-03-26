var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "timeout",
        milliseconds: 0,
        scripts: [
          {
            tag: "playAudio",
            assetId: "test",
            group: "se"
          },
          {
            tag: "jump",
            label: "content"
          }
        ]
      }
    ])
  ]
});
