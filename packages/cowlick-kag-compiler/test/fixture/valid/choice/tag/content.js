var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "choice",
          data: {
            layer: {
              name: "choice"
            },
            values: [
              {
                tag: "jump",
                data: {
                  label: "content",
                  frame: 0
                },
                text: "test1"
              },
              {
                tag: "jump",
                data: {
                  label: "content",
                  frame: 1
                },
                text: "test2"
              }
            ]
          }
        },
        {
          tag: "trigger",
          data: 1
        }
      ]),
      new core.Frame([
        {
          tag: "text",
          data: {
            values: ["テスト2"]
          }
        }
      ])
    ]
  })
]);
