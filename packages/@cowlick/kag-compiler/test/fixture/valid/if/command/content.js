var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "ifElse",
        conditions: [
          {
            path: "content_0_0_0",
            scripts: [
              {
                tag: "playAudio",
                assetId: "test",
                group: "bgm"
              },
              {
                tag: "text",
                values: ["first"]
              }
            ]
          },
          {
            path: "content_0_0_1",
            scripts: [
              {
                tag: "text",
                values: ["second"]
              }
            ]
          }
        ],
        elseBody: [
          {
            tag: "text",
            values: ["third"]
          }
        ]
      }
    ])
  ]
});
