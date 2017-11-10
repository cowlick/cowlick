import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "image",
          data: {
            assetId: "test",
            layer: {
              name: "base",
              x: 0,
              y: 0
            }
          }
        }
      ])
    ]
  })
]);