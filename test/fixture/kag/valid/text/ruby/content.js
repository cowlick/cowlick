import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
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