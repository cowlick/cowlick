import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "timeout",
          data: {
            milliseconds: 0,
            scripts: [
              {
                tag: "jump",
                data: {
                  label: "content"
                }
              }
            ]
          }
        },
        {
          tag: "timeout",
          data: {
            milliseconds: 0,
            scripts: [
              {
                tag: "jump",
                data: {
                  label: "content",
                  frame: 0
                }
              }
            ]
          }
        }
      ])
    ]
  })
]);