import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "layerConfig",
          data: {
            name: "message",
            visible: false
          }
        },
        {
          tag: "click",
          data: [
            {
              tag: "layerConfig",
              data: {
                name: "message",
                visible: true
              }
            }
          ]
        }
      ])
    ]
  })
]);