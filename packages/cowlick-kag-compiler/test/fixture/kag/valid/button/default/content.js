import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "button",
          data: {
            image: {
              assetId: "test",
              layer: {
                name: "choice"
              }
            },
            x: 0,
            y: 0,
            scripts: [
              {
                tag: "jump",
                data: {
                  label: "content"
                }
              }
            ]
          }
        }
      ])
    ]
  })
]);