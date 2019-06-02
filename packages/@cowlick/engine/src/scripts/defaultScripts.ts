import * as tl from "@akashic-extension/akashic-timeline";
import {Scrollable} from "@xnv/akashic-scrollable";
import * as pg from "@pocketberserker/akashic-pagination";
import * as core from "@cowlick/core";
import {Config} from "@cowlick/config";
import {Scene} from "../components/Scene";
import {SceneController} from "../components/SceneController";
import {ImageButton} from "../components/ImageButton";
import {LabelButton, LabelButtonParameters} from "../components/LabelButton";
import {createImage} from "../components/Image";
import {Slider} from "../components/Slider";
import {Message} from "../components/Message";
import {ScriptFunction} from "./ScriptManager";
import {Engine} from "../Engine";

const image = (controller: SceneController, image: core.Image) => {
  const scene = controller.current;
  scene.appendLayer(createImage(scene.body, image), image.layer);
  scene.applyLayerConfig({
    name: image.layer.name,
    opacity: image.layer.opacity,
    visible: image.layer.visible
  });
};

const pane = (controller: SceneController, pane: core.Pane) => {
  const scene = controller.current;
  const p = new g.Pane({
    scene: scene.body,
    width: pane.width,
    height: pane.height,
    x: pane.layer.x,
    y: pane.layer.y,
    backgroundImage: pane.backgroundImage ? (scene.body.assets[pane.backgroundImage] as g.ImageAsset) : undefined,
    padding: pane.padding,
    backgroundEffector: pane.backgroundEffector
      ? new g.NinePatchSurfaceEffector(scene.game, pane.backgroundEffector.borderWidth)
      : undefined
  });
  p.touchable = !!pane.touchable;
  scene.appendLayer(p, pane.layer);
};

const jump = (controller: SceneController, target: core.Jump) => {
  controller.jump(target);
};

const button = (controller: SceneController, data: core.Button) => {
  const button = new ImageButton(controller.current.body, data.image);
  button.move(data.image.layer.x, data.image.layer.y);
  button.click.add(() => {
    for (const s of data.scripts) {
      Engine.scriptManager.call(controller, s);
    }
  });
  controller.current.appendLayer(button, data.image.layer);
};

const choice = (controller: SceneController, choice: core.Choice) => {
  const game = controller.game;
  const count = choice.values.length;
  // TODO: 計算式を書き直す
  const width = choice.width ? choice.width : (game.width / 4) * 3;
  const height = choice.height ? choice.height : 32;
  const margin = choice.margin ? choice.margin : 10;
  const baseX = choice.layer.x !== undefined ? choice.layer.x : width / 6;
  const baseY =
    choice.layer.y !== undefined ? choice.layer.y : ((game.height / 3) * 2 - height * count - margin * (count - 1)) / 2;
  let index = 0;
  for (const item of choice.values) {
    if (item.path) {
      const f = g._require(game, item.path);
      if (!f(controller.current.gameState.variables)) {
        continue;
      }
    }
    let button = new LabelButton({
      scene: controller.current.body,
      width,
      height,
      backgroundImage: choice.backgroundImage,
      padding: choice.padding,
      backgroundEffector: choice.backgroundEffector,
      text: item.text,
      config: controller.config,
      gameState: controller.current.gameState
    });
    button.click.add(() => {
      Engine.scriptManager.call(controller, item);
    });
    const direction = choice.direction ? choice.direction : core.Direction.Vertical;
    switch (direction) {
      case core.Direction.Vertical:
        button.move(baseX, baseY + (height + margin) * index);
        break;
      case core.Direction.Horizontal:
        button.move(baseX + (width + margin) * index, baseY);
        break;
    }
    controller.current.appendLayer(button, choice.layer);
    index++;
  }
};

const createLink = (scene: Scene, config: Config, link: core.Link) => {
  const params: LabelButtonParameters = {
    scene: scene.body,
    width: link.width,
    height: link.height,
    backgroundImage: link.backgroundImage,
    padding: link.padding,
    backgroundEffector: link.backgroundEffector,
    text: link.text,
    config,
    gameState: scene.gameState
  };
  if (link.fontSize) {
    params.fontSize = link.fontSize;
  }
  const button = new LabelButton(params);
  button.move(link.layer.x, link.layer.y);
  return button;
};

const link = (controller: SceneController, link: core.Link) => {
  const l = createLink(controller.current, controller.config, link);
  for (const script of link.scripts) {
    l.click.add(() => {
      Engine.scriptManager.call(controller, script);
    });
  }
  controller.current.appendLayer(l, link.layer);
};

const text = (controller: SceneController, text: core.Text) => {
  controller.current.updateText(text);
};

const layerConfig = (controller: SceneController, config: core.LayerConfig) => {
  controller.current.applyLayerConfig(config);
};

const playAudio = (controller: SceneController, audio: core.PlayAudio) => {
  controller.current.playAudio(audio);
};

const changeVolume = (controller: SceneController, data: core.ChangeVolume) => {
  controller.current.changeVolume(data);
};

const stopAudio = (controller: SceneController, audio: core.StopAudio) => {
  controller.current.stopAudio(audio);
};

const playVideo = (controller: SceneController, video: core.Video) => {
  controller.current.playVideo(video);
};

const stopVideo = (controller: SceneController, video: core.Video) => {
  controller.current.stopVideo(video);
};

const click = (controller: SceneController, data: core.Click) => {
  const scene = controller.current.body;
  scene.pointUpCapture.addOnce(() => {
    for (const s of data.scripts) {
      Engine.scriptManager.call(controller, s);
    }
  }, scene);
};

const skip = (controller: SceneController, _: any) => {
  controller.current.requestNextFrame();
};

const trigger = (controller: SceneController, trigger: core.Trigger) => {
  switch (trigger.value) {
    case core.TriggerValue.Off:
      controller.current.disableWindowClick();
      break;
    case core.TriggerValue.On:
      controller.current.enableWindowClick();
      break;
  }
};

const save = (controller: SceneController, data: core.Save) => {
  controller.save(data);
};

const load = (controller: SceneController, data: core.Load) => {
  controller.load(data);
};

const evaluate = (controller: SceneController, info: core.Eval) => {
  const f = g._require(controller.game, info.path);
  f(controller.current.gameState.variables);
};

const condition = (controller: SceneController, cond: core.Condition) => {
  const f = g._require(controller.game, cond.path);
  if (f(controller.current.gameState.variables)) {
    for (const s of cond.scripts) {
      Engine.scriptManager.call(controller, s);
    }
    return true;
  }
  return false;
};

const backlog = (controller: SceneController, data: core.Backlog) => {
  const layer = {name: core.LayerKind.backlog};

  for (const s of data.scripts) {
    Engine.scriptManager.call(controller, s);
  }

  const scene = controller.current;
  const enabled = scene.enabledWindowClick;
  if (enabled) {
    trigger(controller, {tag: core.Tag.trigger, value: core.TriggerValue.Off});
  }

  const scrollable = new Scrollable({
    scene: scene.body,
    x: 20,
    y: 50,
    width: controller.game.width - 50,
    height: controller.game.height - 70,
    vertical: true,
    horizontal: false
  });
  scene.appendLayer(scrollable, layer);

  const message = new Message({
    scene: scene.body,
    config: controller.config,
    width: controller.game.width - 60,
    x: 0,
    y: 0,
    gameState: scene.gameState
  });
  const text: core.Text = {
    tag: core.Tag.text,
    values: []
  };
  for (const log of controller.backlog) {
    if (log.text) {
      if (text.values.length !== 0) {
        text.values.push("\n", log.text);
      } else {
        text.values.push(log.text);
      }
    }
  }
  message.updateText(text);
  message.showAll();
  scrollable.content.append(message);

  const scripts: core.Script[] = [
    {
      tag: core.Tag.removeLayer,
      name: layer.name
    }
  ];
  if (enabled) {
    scripts.push({
      tag: core.Tag.trigger,
      value: core.TriggerValue.On
    });
  }

  const width = 80;
  const l: core.Link = {
    tag: core.Tag.link,
    layer: {
      name: layer.name,
      x: controller.game.width - width - 10,
      y: 20
    },
    width,
    height: 24,
    text: "close",
    scripts
  };
  link(controller, l);
};

const removeLayer = (controller: SceneController, target: core.RemoveLayer) => {
  controller.current.removeLayer(target.name);
};

const clearSystemVariables = (controller: SceneController, _: any) => {
  controller.current.gameState.variables.system = {};
};

const clearCurrentVariables = (controller: SceneController, _: any) => {
  controller.current.gameState.variables.current = {};
};

const fadeIn = (controller: SceneController, info: core.Fade) => {
  controller.current.transition(info.layer, layer => {
    const timeline = new tl.Timeline(controller.current.body);
    timeline
      .create(layer, {modified: layer.modified, destroyed: layer.destroyed})
      .fadeIn(info.duration)
      .call(() => {
        for (const s of info.after) {
          Engine.scriptManager.call(controller, s);
        }
      });
  });
};

const fadeOut = (controller: SceneController, info: core.Fade) => {
  controller.current.transition(info.layer, layer => {
    let timeline = new tl.Timeline(controller.current.body);
    timeline
      .create(layer, {modified: layer.modified, destroyed: layer.destroyed})
      .fadeOut(info.duration)
      .call(() => {
        for (const s of info.after) {
          Engine.scriptManager.call(controller, s);
        }
      });
  });
};

const timeout = (controller: SceneController, info: core.Timeout) => {
  controller.current.body.setTimeout(() => {
    for (const s of info.scripts) {
      Engine.scriptManager.call(controller, s);
    }
  }, info.milliseconds);
};

const ifElse = (controller: SceneController, data: core.IfElse) => {
  for (const c of data.conditions) {
    if (condition(controller, c)) {
      return;
    }
  }
  for (const s of data.elseBody) {
    Engine.scriptManager.call(controller, s);
  }
};

const exception = (controller: SceneController, e: core.GameError) => {
  controller.game.logger.warn(e.message, e.data);
};

const slider = (controller: SceneController, info: core.Slider) => {
  const s = new Slider({
    scene: controller.current.body,
    width: 0,
    height: 0,
    x: info.layer.x,
    y: info.layer.y,
    data: info,
    state: controller.current.gameState
  });
  controller.current.appendLayer(s, info.layer);
};

export const autoMode = (controller: SceneController, _: any) => {
  if (controller.current.gameState.getValue({type: core.VariableType.builtin, name: core.BuiltinVariable.autoMode})) {
    controller.current.setAutoTrigger();
  }
};

const closeLoadScene = (controller: SceneController, _: any) => {
  controller.closeSaveLoadScene();
};

const onLoadedSaveLoadScene = (
  scene: Scene,
  controller: SceneController,
  info: core.SaveLoadScene,
  create: (i: number) => core.Script[]
) => {
  let position: pg.Position = pg.Position.Top;
  switch (info.button) {
    case core.Position.Top:
      position = pg.Position.Top;
      break;
    case core.Position.Bottom:
      position = pg.Position.Bottom;
      break;
  }
  const pagination = new pg.Pagination({
    scene: scene.body,
    x: 20,
    y: 40,
    width: scene.body.game.width - 40,
    height: scene.body.game.height - 50,
    limit: {
      vertical: info.vertical,
      horizontal: info.horizontal
    },
    position,
    paddingRight: info.padding,
    first: true,
    last: true
  });
  scene.body.append(pagination);
  for (let i = 0; i < controller.config.system.maxSaveCount; i++) {
    const l: core.Link = {
      tag: core.Tag.link,
      layer: info.base.layer,
      width: info.base.width,
      height: info.base.height,
      backgroundImage: info.base.backgroundImage,
      padding: info.base.padding,
      backgroundEffector: info.base.backgroundEffector,
      text: String(i),
      scripts: create(i)
    };
    const button = createLink(scene, controller.config, l);
    button.click.add(() => {
      for (const script of l.scripts) {
        Engine.scriptManager.call(controller, script);
      }
    });
    pagination.content.append(button);
  }
};

const openSaveLoadScene = (
  controller: SceneController,
  info: core.SaveLoadScene,
  create: (i: number) => core.Script[]
) => {
  controller.openSaveLoadScene(scene => onLoadedSaveLoadScene(scene, controller, info, create));
};

const openSaveScene = (controller: SceneController, info: core.SaveLoadScene) => {
  openSaveLoadScene(controller, info, index => [
    {
      tag: core.Tag.save,
      index,
      force: true
    }
  ]);
};

const openLoadScene = (controller: SceneController, info: core.SaveLoadScene) => {
  openSaveLoadScene(controller, info, index => [
    {
      tag: core.Tag.closeLoadScene
    },
    {
      tag: core.Tag.load,
      index
    }
  ]);
};

const messageSpeed = (controller: SceneController, data: core.MessageSpeed) => {
  controller.current.gameState.setValue(
    {type: core.VariableType.builtin, name: core.BuiltinVariable.messageSpeed},
    data.speed
  );
  controller.current.applyMessageSpeed();
};

const fontSetting = (controller: SceneController, data: core.Font) => {
  if (data.size) {
    controller.current.gameState.setValue(
      {
        type: core.VariableType.builtin,
        name: core.BuiltinVariable.fontSize
      },
      data.size === "default" ? controller.config.font.size : data.size
    );
  }
  if (data.color) {
    controller.current.gameState.setValue(
      {
        type: core.VariableType.builtin,
        name: core.BuiltinVariable.fontColor
      },
      data.color === "default" ? controller.config.font.color : data.color
    );
  }
  controller.current.applyFontSetting();
};

const realTimeDisplay = (controller: SceneController, setting: core.RealTimeDisplay) => {
  controller.current.gameState.setValue(
    {type: core.VariableType.builtin, name: core.BuiltinVariable.realTimeDisplay},
    setting.enabled
  );
};

export const defaultScripts = new Map<string, ScriptFunction>([
  [core.Tag.image, image],
  [core.Tag.pane, pane],
  [core.Tag.jump, jump],
  [core.Tag.button, button],
  [core.Tag.choice, choice],
  [core.Tag.link, link],
  [core.Tag.text, text],
  [core.Tag.layer, layerConfig],
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
  [core.Tag.slider, slider],
  [core.Tag.autoMode, autoMode],
  [core.Tag.closeLoadScene, closeLoadScene],
  [core.Tag.openSaveScene, openSaveScene],
  [core.Tag.openLoadScene, openLoadScene],
  [core.Tag.messageSpeed, messageSpeed],
  [core.Tag.font, fontSetting],
  [core.Tag.realTimeDisplay, realTimeDisplay]
]);
