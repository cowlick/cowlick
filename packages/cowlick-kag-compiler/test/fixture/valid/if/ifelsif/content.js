var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "ifElse",
          data: {
            conditions: [
              {
                path: "content_0_0_0",
                scripts: [
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
            elseBody: []
          }
        }
      ])
    ]
  })
]);