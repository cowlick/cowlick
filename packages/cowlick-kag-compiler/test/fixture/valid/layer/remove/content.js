import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "removeLayer",
          data: {
            name: "test"
          }
        }
      ])
    ]
  })
]);