"use strict";
import {Scenario} from "./models/Scenario";
import * as script from "./models/Script";
import {GameState} from "./models/GameState";
import {Scene} from "./components/Scene";
import {Button} from "./components/Button";
import {LabelButton} from "./components/LabelButton";
import {StorageViewModel} from "./vm/StorageViewModel";
import {Config, defaultConfig} from "./Config";
import {ScriptManager, ScriptFunction} from "./ScriptManager";
import {Tag} from "./Constant";
import {createStorageKeys} from "./GameStateHelper";

export class Engine {

  private game: g.Game;
  private static scriptManager = new ScriptManager();
  private static _config = defaultConfig;
  // 仮置き
  static player: g.Player = { id: "0" };

  constructor(game: g.Game) {
    this.game = game;

    Engine.scriptManager.register(Tag.image, Engine.image);
    Engine.scriptManager.register(Tag.pane, Engine.pane);
    Engine.scriptManager.register(Tag.jump, Engine.jump);
    Engine.scriptManager.register(Tag.button, Engine.button);
    Engine.scriptManager.register(Tag.choice, Engine.choice);
    Engine.scriptManager.register(Tag.text, Engine.text);
    Engine.scriptManager.register(Tag.visible, Engine.visible);
    Engine.scriptManager.register(Tag.playAudio, Engine.playAudio);
    Engine.scriptManager.register(Tag.stopAudio, Engine.stopAudio);
    Engine.scriptManager.register(Tag.playVideo, Engine.playVideo);
    Engine.scriptManager.register(Tag.changeVolume, Engine.changeVolume);
    Engine.scriptManager.register(Tag.stopVideo, Engine.stopVideo);
    Engine.scriptManager.register(Tag.click, Engine.click);
    Engine.scriptManager.register(Tag.trigger, Engine.trigger);
    Engine.scriptManager.register(Tag.save, Engine.save);
    Engine.scriptManager.register(Tag.load, Engine.load);
    Engine.scriptManager.register(Tag.evaluate, Engine.evaluate);
  }

  set config(value: Config) {
    Engine._config = value;
  }

  start(scenario?: Scenario): void {

    const s = scenario ? scenario : Scenario.load(this.game);

    const storageKeys = createStorageKeys(Engine.player, Engine._config.system.maxSaveCount);

    const scene = new Scene({
      game: this.game,
      scenario: s,
      scriptManager: Engine.scriptManager,
      config: Engine.config,
      player: Engine.player,
      storageKeys
    });
    this.game.pushScene(scene);
  }

  script(name: string, f: ScriptFunction) {
    Engine.scriptManager.register(name, f);
  }

  private static get config() {
    return Engine._config;
  }

  private static image(scene: Scene, image: script.Image) {
    const asset = <g.ImageAsset>scene.assets[image.assetId];
    let sprite: g.Sprite;
    if(image.frame) {
      let s = new g.FrameSprite({
        scene,
        src: asset,
        width: image.frame.width,
        height: image.frame.height
      });
      s.frames = image.frame.frames;
      s.interval = 1000;
      s.start();
      sprite = s;
    } else {
      sprite = new g.Sprite({
        scene,
        src: asset
      });
    }
    if(image.x !== undefined) {
      sprite.x = image.x;
    }
    if(image.y !== undefined) {
      sprite.y = image.y;
    }
    sprite.invalidate();
    scene.appendLayer(sprite, image.layer);
  }

  private static pane(scene: Scene, pane: script.Pane) {
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

  private static jump(scene: Scene, target: script.Jump) {
    scene.jump(target);
  }

  private static button(scene: Scene, data: script.Button) {
    const button = new Button({
      scene,
      width: data.width,
      height: data.height,
      backgroundImage: data.backgroundImage,
      padding: data.padding,
      backgroundEffector: data.backgroundEffector
    });
    button.move(data.x, data.y);
    button.click.add(() => {
      for(const s of data.scripts) {
        Engine.scriptManager.call(scene, s);
      }
    });
    scene.appendLayer(button, data.layer);
  }

  private static choice(scene: Scene, choice: script.Choice) {
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

  private static text(scene: Scene, text: script.Text) {
    scene.updateText(text.value);
  }

  private static visible(scene: Scene, visibility: script.Visibility) {
    scene.visible(visibility);
  }

  private static playAudio(scene: Scene, audio: script.Audio) {
    scene.playAudio(audio);
  }

  private static changeVolume(scene: Scene, data: script.ChangeVolume) {
    scene.changeVolume(data);
  }

  private static stopAudio(scene: Scene, audio: script.Audio) {
    scene.stopAudio(audio);
  }

  private static playVideo(scene: Scene, video: script.Video) {
    scene.playVideo(video);
  }

  private static stopVideo(scene: Scene, video: script.Video) {
    scene.stopVideo(video);
  }

  private static click(scene: Scene, data: any) {
    scene.addSkipTrigger();
  }

  private static trigger(scene: Scene, trigger: script.Trigger) {
    switch(trigger) {
      case script.Trigger.Off:
        scene.disableWindowClick();
        break;
      case script.Trigger.On:
        scene.enableWindowClick();
        break;
    }
  }

  private static save(scene: Scene, data: script.Save) {
    const result = scene.save(scene.source.scene, data);
    if(typeof result === "string") {
      scene.game.logger.warn(result);
    }
  }

  private static load(scene: Scene, data: script.Load) {
    const s = scene.load(data.index);
    if(s) {
      Engine.jump(scene, s);
    } else {
      scene.game.logger.warn("save data not found: " + data.index);
    }
  }

  private static evaluate(scene: Scene, info: script.Eval) {
    const f = g._require(scene.game, info.path);
    f(scene.gameState.variables);
  }
}
