import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "choice",
          data: {
            layer: {
              name: "choice"
            },
            values: [
              {
                tag: "jump",
                data: {
                  label: "content",
                  frame: 0
                },
                text: "test1"
              },
              {
                tag: "jump",
                data: {
                  label: "content",
                  frame: 0
                },
                text: "test2"
              }
            ]
          }
        }
      ])
    ]
  })
]);