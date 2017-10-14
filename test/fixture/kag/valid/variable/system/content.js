import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "text",
          data: {
            clear: true,
            values: [
              "テスト: ",
              {
                type: "system",
                name: "test"
              },
              "\ntest"
            ]
          }
        }
      ])
    ]
  })
]);