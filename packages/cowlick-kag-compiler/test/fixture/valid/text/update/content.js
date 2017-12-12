var core = require("cowlick-core");

module.exports = new core.Scenario([
  new core.Scene({
    label: "content",
    frames: [
      new core.Frame([
        {
          tag: "removeLayer",
          data: {
            name: "choice"
          }
        },
        {
          tag: "text",
          data: {
            clear: true,
            values: ["テスト\n1"]
          }
        }
      ])
    ]
  })
]);
