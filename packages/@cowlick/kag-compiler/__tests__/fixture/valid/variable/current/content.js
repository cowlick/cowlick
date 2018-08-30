var core = require("@cowlick/core");

module.exports = new core.Scene({
  label: "content",
  frames: [
    new core.Frame([
      {
        tag: "removeLayer",
        name: "choice"
      },
      {
        tag: "text",
        clear: true,
        values: [
          "テスト: ",
          {
            type: "current",
            name: "test"
          },
          "\ntest"
        ]
      }
    ])
  ]
});
