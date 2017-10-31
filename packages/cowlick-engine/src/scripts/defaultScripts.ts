"use strict";
import * as tl from "@akashic-extension/akashic-timeline";
import {Scrollable} from "@xnv/akashic-scrollable";
import * as core from "cowlick-core";
import {SceneController} from "../components/SceneController";
import {ImageButton} from "../components/ImageButton";
import {LabelButton, LabelButtonParameters} from "../components/LabelButton";
import {createImage} from "../components/Image";
import {Slider} from "../components/Slider";
import {Message} from "../components/Message";
import {ScriptFunction} from "./ScriptManager";
import {Engine} from "../Engine";

function image(controller: SceneController, image: core.Image) {
  const scene = controller.current;
  scene.appendLayer(createImage(scene, image), image.layer);
  scene.applyLayerConfig({
    name: image.layer.name,
    opacity: image.layer.opacity,
    visible: image.layer.visible
  });
}

function pane(controller: SceneController, pane: core.Pane) {
  const scene = controller.current;
  const p = new g.Pane({
    scene,
    width: pane.width,
    height: pane.height,
    x: pane.layer.x,
    y: pane.layer.y,
    backgroundImage: pane.backgroundImage ? scene.assets[pane.backgroundImage] as g.ImageAsset : undefined,
    padding: pane.padding,
    backgroundEffector: pane.backgroundEffector ? new g.NinePatchSurfaceEffector(scene.game, pane.backgroundEffector.borderWidth) : undefined
  });
  p.touchable = !!pane.touchable;
  scene.appendLayer(p, pane.layer);
}

function jump(controller: SceneController, target: core.Jump) {
  controller.jump(target);
}

function button(controller: SceneController, data: core.Button) {
  const button = ImageButton.create(controller.current, data);
  button.move(data.x, data.y);
  button.click.add(() => {
    for(const s of data.scripts) {
      Engine.scriptManager.call(controller, s);
    }
  });
  controller.current.appendLayer(button, data.layer);
}

function choice(controller: SceneController, choice: core.Choice) {
  const game = controller.game;
  const count = choice.values.length;
  // TODO: 計算式を書き直す
  const width = choice.width ? choice.width : game.width / 4 * 3;
  const height = choice.height ? choice.height : 32;
  const space = 10;
  const baseX = choice.x ? choice.x : width / 6;
  const baseY = choice.y ? choice.y : (game.height / 3 * 2 - height * count - space * (count - 1)) / 2;
  let index = 0;
  for(const item of choice.values) {
    if(item.path) {
      const f = g._require(game, item.path);
      if(! f(controller.current.gameState.variables)) {
        continue;
      }
    }
    let button = new LabelButton({
      scene: controller.current,
      width,
      height,
      backgroundImage: choice.backgroundImage,
      padding: choice.padding,
      backgroundEffector: choice.backgroundEffector,
      text: item.text,
      config: Engine.config,
      gameState: controller.current.gameState
    });
    button.click.add(() => {
      Engine.scriptManager.call(controller, item);
    });
    const direction = choice.direction ? choice.direction : core.Direction.Vertical;
    switch(direction) {
      case core.Direction.Vertical:
        button.move(baseX, baseY + (height + space) * index);
        break;
      case core.Direction.Horizontal:
        button.move(baseX + (width + space) * index, baseY);
        break;
    }
    controller.current.appendLayer(button, choice.layer);
    index++;
  }
}

function link(controller: SceneController, link: core.Link) {
  const game = controller.game;
  const params: LabelButtonParameters = {
    scene: controller.current,
    width: link.width,
    height: link.height,
    backgroundImage: link.backgroundImage,
    padding: link.padding,
    backgroundEffector: link.backgroundEffector,
    text: link.text,
    config: Engine.config,
    gameState: controller.current.gameState
  };
  if(link.fontSize) {
    params.fontSize = link.fontSize;
  }
  const button = new LabelButton(params);
  for(const script of link.scripts) {
    button.click.add(() => {
      Engine.scriptManager.call(controller, script);
    });
  }
  button.move(link.x, link.y);
  controller.current.appendLayer(button, link.layer);
}

function text(controller: SceneController, text: core.Text) {
  controller.current.updateText(text);
}

function layerConfig(controller: SceneController, config: core.LayerConfig) {
  controller.current.applyLayerConfig(config);
}

function playAudio(controller: SceneController, audio: core.Audio) {
  controller.current.playAudio(audio);
}

function changeVolume(controller: SceneController, data: core.ChangeVolume) {
  controller.current.changeVolume(data);
}

function stopAudio(controller: SceneController, audio: core.Audio) {
  controller.current.stopAudio(audio);
}

function playVideo(controller: SceneController, video: core.Video) {
  controller.current.playVideo(video);
}

function stopVideo(controller: SceneController, video: core.Video) {
  controller.current.stopVideo(video);
}

function click(controller: SceneController, scripts: core.Script<any>[]) {
  const scene = controller.current;
  scene.pointUpCapture.addOnce(() => {
    for(const s of scripts) {
      Engine.scriptManager.call(controller, s);
    }
  }, scene);
}

function skip(controller: SceneController, data?: any) {
  controller.current.requestNextFrame();
}

function trigger(controller: SceneController, trigger: core.Trigger) {
  switch(trigger) {
    case core.Trigger.Off:
      controller.current.disableWindowClick();
      break;
    case core.Trigger.On:
      controller.current.enableWindowClick();
      break;
  }
}

function save(controller: SceneController, data: core.Save) {
  controller.current.save(controller.current.source, data);
}

function load(controller: SceneController, data: core.Load) {
  const s = controller.current.load(data.index);
  if(s) {
    jump(controller, s);
  } else {
    throw new core.GameError("save data not found", data);
  }
}

function evaluate(controller: SceneController, info: core.Eval) {
  const f = g._require(controller.game, info.path);
  f(controller.current.gameState.variables);
}

function condition(controller: SceneController, cond: core.Condition) {
  const f = g._require(controller.game, cond.path);
  if(f(controller.current.gameState.variables)) {
    for(const s of cond.scripts) {
      Engine.scriptManager.call(controller, s);
    }
    return true;
  }
  return false;
}

function backlog(controller: SceneController, data: core.Backlog) {
  const layer = { name: core.Layer.backlog };

  for(const s of data.scripts) {
    Engine.scriptManager.call(controller, s);
  }

  const scene = controller.current;
  const enabled = scene.enabledWindowClick;
  if(enabled) {
    trigger(controller, core.Trigger.Off);
  }

  const scrollable = new Scrollable({
    scene,
    x: 20,
    y: 50,
    width: controller.game.width - 50,
    height: controller.game.height - 70,
    vertical: true,
    horizontal: false
  });
  scene.appendLayer(scrollable, layer);

  const message = new Message({
    scene,
    config: Engine.config,
    width: controller.game.width - 60,
    x: 0,
    y: 0,
    gameState: scene.gameState
  });
  let values: (string | core.Ruby[] | core.Variable)[] = [];
  for(const log of controller.backlog) {
    if(values.length !== 0) {
      values.push("\n", log.text);
    } else {
      values.push(log.text);
    }
  }
  message.updateText({ values });
  message.showAll();
  scrollable.content.append(message);

  const scripts: core.Script<any>[] = [
    {
      tag: core.Tag.removeLayer,
      data: {
        name: layer.name
      }
    }
  ];
  if(enabled) {
    scripts.push({
      tag: core.Tag.trigger,
      data: core.Trigger.On
    });
  }

  const width = 80;
  const l: core.Link = {
    layer,
    x: controller.game.width - width - 10,
    y: 20,
    width,
    height: 24,
    text: "close",
    scripts
  };
  link(controller, l);
}

function removeLayer(controller: SceneController, target: core.RemoveLayer) {
  controller.current.removeLayer(target.name);
}

function clearSystemVariables(controller: SceneController, data: any) {
  controller.current.gameState.variables.system = {};
}

function clearCurrentVariables(controller: SceneController, data: any) {
  controller.current.gameState.variables.current = {};
}

function fadeIn(controller: SceneController, info: core.Fade) {
  controller.current.transition(info.layer, (layer) => {
    let timeline = new tl.Timeline(controller.current);
    timeline.create(layer, {modified: layer.modified, destroyed: layer.destroyed})
      .fadeIn(info.duration);
  });
}

function fadeOut(controller: SceneController, info: core.Fade) {
  controller.current.transition(info.layer, (layer) => {
    let timeline = new tl.Timeline(controller.current);
    timeline.create(layer, {modified: layer.modified, destroyed: layer.destroyed})
      .fadeOut(info.duration);
  });
}

function timeout(controller: SceneController, info: core.Timeout) {
  controller.current.setTimeout(
    () => {
      for(const s of info.scripts) {
        Engine.scriptManager.call(controller, s);
      }
    },
    info.milliseconds
  );
}

function ifElse(controller: SceneController, data: core.IfElse) {
  for(const c of data.conditions) {
    if(condition(controller, c)) {
      return;
    }
  }
  for(const s of data.elseBody) {
    Engine.scriptManager.call(controller, s);
  }
}

function exception(controller: SceneController, e: Error) {
  if(e instanceof core.GameError) {
    controller.game.logger.warn(e.message, e.data);
  } else {
    controller.game.logger.warn(e.message);
  }
}

function waitTransition(controller: SceneController, data: core.WaitTransition) {
  if(typeof data.skippable !== "undefined" && ! data.skippable) {
    trigger(controller, core.Trigger.Off);
  }
  for(const s of data.scripts) {
    Engine.scriptManager.call(controller, s);
  }
  skip(controller);
}

function slider(controller: SceneController, info: core.Slider) {
  const s = new Slider({
    scene: controller.current,
    width: 0,
    height: 0,
    x: info.layer.x,
    y: info.layer.y,
    data: info,
    state: controller.current.gameState
  });
  controller.current.appendLayer(s, info.layer);
}

export function autoMode(controller: SceneController, data: any) {
  if(controller.current.gameState.getValue({ type: core.VariableType.builtin, name: core.BuiltinVariable.autoMode })) {
    controller.current.setAutoTrigger();
  }
}

export const defaultSctipts = new Map<string, ScriptFunction>([
  [core.Tag.image, image],
  [core.Tag.pane, pane],
  [core.Tag.jump, jump],
  [core.Tag.button, button],
  [core.Tag.choice, choice],
  [core.Tag.link, link],
  [core.Tag.text, text],
  [core.Tag.layerConfig, layerConfig],
  [core.Tag.playAudio, playAudio],
  [core.Tag.stopAudio, stopAudio],
  [core.Tag.playVideo, playVideo],
  [core.Tag.changeVolume, changeVolume],
  [core.Tag.stopVideo, stopVideo],
  [core.Tag.click, click],
  [core.Tag.skip, skip],
  [core.Tag.trigger, trigger],
  [core.Tag.save, save],
  [core.Tag.load, load],
  [core.Tag.evaluate, evaluate],
  [core.Tag.condition, condition],
  [core.Tag.backlog, backlog],
  [core.Tag.removeLayer, removeLayer],
  [core.Tag.clearSystemVariables, clearSystemVariables],
  [core.Tag.clearCurrentVariables, clearCurrentVariables],
  [core.Tag.fadeIn, fadeIn],
  [core.Tag.fadeOut, fadeOut],
  [core.Tag.timeout, timeout],
  [core.Tag.ifElse, ifElse],
  [core.Tag.exception, exception],
  [core.Tag.waitTransition, waitTransition],
  [core.Tag.slider, slider],
  [core.Tag.autoMode, autoMode]
]);
