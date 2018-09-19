import * as core from "@cowlick/core";
import * as novel from "@cowlick/engine";

module.exports = (engine: novel.Engine) => {
  const choiceScript = novel.defaultScripts.get(core.Tag.choice);
  engine.script(core.Tag.choice, (controller: novel.SceneController, value: core.Choice) => {
    value.backgroundImage = "pane";
    value.padding = 4;
    value.backgroundEffector = {
      borderWidth: 4
    };
    choiceScript(controller, value);
  });
};
