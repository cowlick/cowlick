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
            groupName: "bgm"
          }
        },
        {
          tag: "stopAudio",
          data: {
            assetId: null,
            groupName: "bgm"
          }
        }
      ])
    ]
  })
]);