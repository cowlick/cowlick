import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "eval",
          data: {
            path: "content_0_0"
          }
        }
      ])
    ]
  })
]);