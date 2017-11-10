import {Scenario, Scene, Frame} from "cowlick-core";

module.exports = new Scenario([
  new Scene({
    label: "content",
    frames: [
      new Frame([
        {
          tag: "ifElse",
          data: {
            conditions: [
              {
                path: "content_0_0_0",
                scripts: [
                  {
                    tag: "playAudio",
                    data: {
                      assetId: "test",
                      group: "bgm"
                    }
                  },
                  {
                    tag: "text",
                    data: {
                      values: [
                        "first"
                      ]
                    }
                  }
                ]
              },
              {
                path: "content_0_0_1",
                scripts: [
                  {
                    tag: "text",
                    data: {
                      values: [
                        "second"
                      ]
                    }
                  }
                ]
              }
            ],
            elseBody: [
              {
                tag: "text",
                data: {
                  values: [
                    "third"
                  ]
                }
              }
            ]
          }
        }
      ])
    ]
  })
]);