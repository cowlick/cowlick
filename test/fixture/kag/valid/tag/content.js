import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "foo",
          data: {
            bar: "test",
            buz: "test"
          }
        }
      ])
    ]
  })
]);