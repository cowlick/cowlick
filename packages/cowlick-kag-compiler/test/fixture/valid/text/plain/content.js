import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "text",
          data: {
            values: [
              "テスト\n1"
            ]
          }
        }
      ])
    ]
  })
]);