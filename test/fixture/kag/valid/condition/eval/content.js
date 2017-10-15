import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "condition",
          data: {
            path: "content_0_0",
            scripts: [
              {
                tag: "eval",
                data: {
                  path: "content_0_0_0"
                }
              }
            ]
          }
        }
      ])
    ]
  })
]);