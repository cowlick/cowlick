var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "text",
          data: {
            values: [
              "テスト",
              [
                {
                  value: "{\"rb\":\"漢\",\"rt\":\"かん\"}"
                }
              ],
              [
                {
                  value: "{\"rb\":\"字\",\"rt\":\"じ\"}"
                }
              ],
              "テスト"
            ]
          }
        }
      ])
    ]
  })
]);