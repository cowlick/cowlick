"use strict";
import * as script from "../models/Script";
import {Scene} from "../components/Scene";
import {ImageButton} from "../components/ImageButton";
import {LabelButton} from "../components/LabelButton";
import {createImage} from "../components/Image";
import {Message} from "../components/Message";
import {ScriptFunction} from "./ScriptManager";
import {Tag, Layer} from "../Constant";
import {Engine} from "../Engine";

function image(scene: Scene, image: script.Image) {
  scene.appendLayer(createImage(scene, image), image.layer);
}

function pane(scene: Scene, pane: script.Pane) {
  const p = new g.Pane({
    scene,
    width: pane.width,
    height: pane.height,
    x: pane.x,
    y: pane.y,
    backgroundImage: pane.backgroundImage ? scene.assets[pane.backgroundImage] as g.ImageAsset : undefined,
    padding: pane.padding,
    backgroundEffector: pane.backgroundEffector ? new g.NinePatchSurfaceEffector(scene.game, pane.backgroundEffector.borderWidth) : undefined
  });
  p.touchable = !!pane.touchable;
  scene.appendLayer(p, pane.layer);
}

function jump(scene: Scene, target: script.Jump) {
  scene.jump(target);
}

function button(scene: Scene, data: script.Button) {
  const button = ImageButton.create(scene, data);
  button.move(data.x, data.y);
  button.click.add(() => {
    for(const s of data.scripts) {
      Engine.scriptManager.call(scene, s);
    }
  });
  scene.appendLayer(button, data.layer);
}

function choice(scene: Scene, choice: script.Choice) {
  const game = scene.game;
  const count = choice.values.length;
  // TODO: 計算式を書き直す
  const width = choice.width ? choice.width : game.width / 4 * 3;
  const height = choice.height ? choice.height : 32;
  const space = 10;
  const baseX = choice.x ? choice.x : width / 6;
  const baseY = choice.y ? choice.y : (game.height / 3 * 2 - height * count - space * (count - 1)) / 2;
  choice.values.forEach((item: script.ChoiceItem, i: number) => {
    let button = new LabelButton({
      scene,
      width,
      height,
      backgroundImage: choice.backgroundImage,
      padding: choice.padding,
      backgroundEffector: choice.backgroundEffector,
      text: item.text,
      config: Engine.config
    });
    button.click.add(() => {
      Engine.scriptManager.call(scene, item);
    });
    const direction = choice.direction ? choice.direction : script.Direction.Vertical;
    switch(direction) {
      case script.Direction.Vertical:
        button.move(baseX, baseY + (height + space) * i);
        break;
      case script.Direction.Horizontal:
        button.move(baseX + (width + space) * i, baseY);
        break;
    }
    scene.appendLayer(button, choice.layer);
  });
}

function link(scene: Scene, link: script.Link) {
  const game = scene.game;
  const button = new LabelButton({
    scene,
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
      Engine.scriptManager.call(scene, script);
    });
  }
  button.move(link.x, link.y);
  scene.appendLayer(button, link.layer);
}

function text(scene: Scene, text: script.Text) {
  scene.updateText(text);
}

function visible(scene: Scene, visibility: script.Visibility) {
  scene.visible(visibility);
}

function playAudio(scene: Scene, audio: script.Audio) {
  scene.playAudio(audio);
}

function changeVolume(scene: Scene, data: script.ChangeVolume) {
  scene.changeVolume(data);
}

function stopAudio(scene: Scene, audio: script.Audio) {
  scene.stopAudio(audio);
}

function playVideo(scene: Scene, video: script.Video) {
  scene.playVideo(video);
}

function stopVideo(scene: Scene, video: script.Video) {
  scene.stopVideo(video);
}

function click(scene: Scene, data: any) {
  scene.addSkipTrigger();
}

function trigger(scene: Scene, trigger: script.Trigger) {
  switch(trigger) {
    case script.Trigger.Off:
      scene.disableWindowClick();
      break;
    case script.Trigger.On:
      scene.enableWindowClick();
      break;
  }
}

function save(scene: Scene, data: script.Save) {
  const result = scene.save(scene.source.scene, data);
  if(typeof result === "string") {
    scene.game.logger.warn(result);
  }
}

function load(scene: Scene, data: script.Load) {
  const s = scene.load(data.index);
  if(s) {
    jump(scene, s);
  } else {
    scene.game.logger.warn("save data not found: " + data.index);
  }
}

function evaluate(scene: Scene, info: script.Eval) {
  const f = g._require(scene.game, info.path);
  f(scene.gameState.variables);
}

function condition(scene: Scene, cond: script.Condition<any>) {
  const f = g._require(scene.game, cond.path);
  if(f(scene.gameState.variables)) {
    Engine.scriptManager.call(scene, cond.script);
  }
}

function backlog(scene: Scene, data: any) {
  const layer = { name: Layer.backlog };

  const message = new Message({
    scene,
    config: Engine.config,
    width: scene.game.width - 20,
    x: 20,
    y: 20
  });
  let values: (string | script.RubyText[])[] = [];
  for(const frame of scene.backlog) {
    for(const vs of frame.scripts.filter(s => s.tag === Tag.text).map(s => (s.data as script.Text).values)) {
      values = values.concat("\n", vs);
    }
  }
  message.updateText({ values });
  message.showAll();
  scene.appendLayer(message, layer);

  const width = 100;
  const l = {
    layer,
    x: scene.game.width - width - 10,
    y: 10,
    width,
    height: 24,
    text: "close",
    scripts: [
      {
        tag: Tag.removeLayer,
        data: {
          name: layer.name
        }
      }
    ]
  };
  link(scene, l);
}

function removeLayer(scene: Scene, target: script.RemoveLayer) {
  scene.removeLayer(target.name);
}

export const defaultSctipts = new Map<string, ScriptFunction>([
  [Tag.image, image],
  [Tag.pane, pane],
  [Tag.jump, jump],
  [Tag.button, button],
  [Tag.choice, choice],
  [Tag.link, link],
  [Tag.text, text],
  [Tag.visible, visible],
  [Tag.playAudio, playAudio],
  [Tag.stopAudio, stopAudio],
  [Tag.playVideo, playVideo],
  [Tag.changeVolume, changeVolume],
  [Tag.stopVideo, stopVideo],
  [Tag.click, click],
  [Tag.trigger, trigger],
  [Tag.save, save],
  [Tag.load, load],
  [Tag.evaluate, evaluate],
  [Tag.condition, condition],
  [Tag.backlog, backlog],
  [Tag.removeLayer, removeLayer]
]);
