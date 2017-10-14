import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "layerConfig",
          data: {
            name: "test",
            x: 0,
            y: 0,
            opacity: 0,
            visible: true
          }
        }
      ])
    ]
  })
]);