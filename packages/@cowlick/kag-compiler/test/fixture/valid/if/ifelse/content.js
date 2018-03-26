var core = require("@cowlick/core");

module.exports = new core.Scene({
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
                    values: ["first"]
                  }
                }
              ]
            }
          ],
          elseBody: [
            {
              tag: "text",
              data: {
                values: ["second"]
              }
            }
          ]
        }
      }
    ])
  ]
});
