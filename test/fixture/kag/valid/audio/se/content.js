import {Scenario, Scene, Frame} from "cowlick";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "playAudio",
          data: {
            assetId: "test",
            groupName: "se"
          }
        },
        {
          tag: "stopAudio",
          data: {
            assetId: null,
            groupName: "se"
          }
        }
      ])
    ]
  })
]);