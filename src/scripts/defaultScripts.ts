"use strict";
import * as tl from "@akashic-extension/akashic-timeline";
import {Scrollable} from "@xnv/akashic-scrollable";
import * as script from "../models/Script";
import {SceneController} from "../components/SceneController";
import {ImageButton} from "../components/ImageButton";
import {LabelButton} from "../components/LabelButton";
import {createImage} from "../components/Image";
import {Message} from "../components/Message";
import {ScriptFunction} from "./ScriptManager";
import {Tag, Layer} from "../Constant";
import {Engine} from "../Engine";

function image(controller: SceneController, image: script.Image) {
  const scene = controller.current;
  scene.appendLayer(createImage(scene, image), image.layer);
  scene.applyLayerConfig({
    name: image.layer.name,
    opacity: image.layer.opacity,
    visible: image.layer.visible
  });
}

function pane(controller: SceneController, pane: script.Pane) {
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

function jump(controller: SceneController, target: script.Jump) {
  controller.jump(target);
}

function button(controller: SceneController, data: script.Button) {
  const button = ImageButton.create(controller.current, data);
  button.move(data.x, data.y);
  button.click.add(() => {
    for(const s of data.scripts) {
      Engine.scriptManager.call(controller, s);
    }
  });
  controller.current.appendLayer(button, data.layer);
}

function choice(controller: SceneController, choice: script.Choice) {
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
      config: Engine.config
    });
    button.click.add(() => {
      Engine.scriptManager.call(controller, item);
    });
    const direction = choice.direction ? choice.direction : script.Direction.Vertical;
    switch(direction) {
      case script.Direction.Vertical:
        button.move(baseX, baseY + (height + space) * index);
        break;
      case script.Direction.Horizontal:
        button.move(baseX + (width + space) * index, baseY);
        break;
    }
    controller.current.appendLayer(button, choice.layer);
    index++;
  }
}

function link(controller: SceneController, link: script.Link) {
  const game = controller.game;
  const button = new LabelButton({
    scene: controller.current,
    width: link.width,
    height: link.height,
    backgroundImage: link.backgroundImage,
    padding: link.padding,
    backgroundEffector: link.backgroundEffector,
    text: link.text,
    config: Engine.config
  });
  for(const script of link.scripts) {
    button.click.add(() => {
      Engine.scriptManager.call(controller, script);
    });
  }
  button.move(link.x, link.y);
  controller.current.appendLayer(button, link.layer);
}

function text(controller: SceneController, text: script.Text) {
  controller.current.updateText(text);
}

function layerConfig(controller: SceneController, config: script.LayerConfig) {
  controller.current.applyLayerConfig(config);
}

function playAudio(controller: SceneController, audio: script.Audio) {
  controller.current.playAudio(audio);
}

function changeVolume(controller: SceneController, data: script.ChangeVolume) {
  controller.current.changeVolume(data);
}

function stopAudio(controller: SceneController, audio: script.Audio) {
  controller.current.stopAudio(audio);
}

function playVideo(controller: SceneController, video: script.Video) {
  controller.current.playVideo(video);
}

function stopVideo(controller: SceneController, video: script.Video) {
  controller.current.stopVideo(video);
}

function click(controller: SceneController, scripts: script.Script<any>[]) {
  const scene = controller.current;
  scene.pointUpCapture.addOnce(() => {
    for(const s of scripts) {
      Engine.scriptManager.call(controller, s);
    }
  }, scene);
}

function skip(controller: SceneController, data: any) {
  controller.current.requestNextFrame();
}

function trigger(controller: SceneController, trigger: script.Trigger) {
  switch(trigger) {
    case script.Trigger.Off:
      controller.current.disableWindowClick();
      break;
    case script.Trigger.On:
      controller.current.enableWindowClick();
      break;
  }
}

function save(controller: SceneController, data: script.Save) {
  const result = controller.current.save(controller.current.source, data);
  if(typeof result === "string") {
    controller.game.logger.warn(result);
  }
}

function load(controller: SceneController, data: script.Load) {
  const s = controller.current.load(data.index);
  if(s) {
    jump(controller, s);
  } else {
    controller.game.logger.warn("save data not found: " + data.index);
  }
}

function evaluate(controller: SceneController, info: script.Eval) {
  const f = g._require(controller.game, info.path);
  f(controller.current.gameState.variables);
}

function condition(controller: SceneController, cond: script.Condition) {
  const f = g._require(controller.game, cond.path);
  if(f(controller.current.gameState.variables)) {
    for(const s of cond.scripts) {
      Engine.scriptManager.call(controller, s);
    }
  }
}

function backlog(controller: SceneController, data: script.Backlog) {
  const layer = { name: Layer.backlog };

  for(const s of data.scripts) {
    Engine.scriptManager.call(controller, s);
  }

  const scene = controller.current;
  const enabled = scene.enabledWindowClick;
  if(enabled) {
    trigger(controller, script.Trigger.Off);
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
  let values: (string | script.Ruby[] | script.Variable)[] = [];
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

  const scripts: script.Script<any>[] = [
    {
      tag: Tag.removeLayer,
      data: {
        name: layer.name
      }
    }
  ];
  if(enabled) {
    scripts.push({
      tag: Tag.trigger,
      data: script.Trigger.On
    });
  }

  const width = 80;
  const l = {
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

function removeLayer(controller: SceneController, target: script.RemoveLayer) {
  controller.current.removeLayer(target.name);
}

function clearSystemVariables(controller: SceneController, data: any) {
  controller.current.gameState.variables.system = {};
}

function clearCurrentVariables(controller: SceneController, data: any) {
  controller.current.gameState.variables.current = {};
}

function fadeIn(controller: SceneController, info: script.Fade) {
  controller.current.transition(info.layer, (layer) => {
    let timeline = new tl.Timeline(controller.current);
    timeline.create(layer, {modified: layer.modified, destroyed: layer.destroyed})
      .fadeIn(info.duration);
  });
}

function fadeOut(controller: SceneController, info: script.Fade) {
  controller.current.transition(info.layer, (layer) => {
    let timeline = new tl.Timeline(controller.current);
    timeline.create(layer, {modified: layer.modified, destroyed: layer.destroyed})
      .fadeOut(info.duration);
  });
}

export const defaultSctipts = new Map<string, ScriptFunction>([
  [Tag.image, image],
  [Tag.pane, pane],
  [Tag.jump, jump],
  [Tag.button, button],
  [Tag.choice, choice],
  [Tag.link, link],
  [Tag.text, text],
  [Tag.layerConfig, layerConfig],
  [Tag.playAudio, playAudio],
  [Tag.stopAudio, stopAudio],
  [Tag.playVideo, playVideo],
  [Tag.changeVolume, changeVolume],
  [Tag.stopVideo, stopVideo],
  [Tag.click, click],
  [Tag.skip, skip],
  [Tag.trigger, trigger],
  [Tag.save, save],
  [Tag.load, load],
  [Tag.evaluate, evaluate],
  [Tag.condition, condition],
  [Tag.backlog, backlog],
  [Tag.removeLayer, removeLayer],
  [Tag.clearSystemVariables, clearSystemVariables],
  [Tag.clearCurrentVariables, clearCurrentVariables],
  [Tag.fadeIn, fadeIn],
  [Tag.fadeOut, fadeOut]
]);
