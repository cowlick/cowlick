import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "playAudio",
          data: {
            assetId: "test",
            group: "bgm"
          }
        },
        {
          tag: "stopAudio",
          data: {
            assetId: null,
            group: "bgm"
          }
        }
      ])
    ]
  })
]);