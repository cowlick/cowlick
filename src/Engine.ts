"use strict";
import {Scenario} from "./models/Scenario";
import {Image} from "./models/Image";
import {Choice} from "./models/Choice";
import {Jump} from "./models/Jump";
import {Scene} from "./components/Scene";
import {ChoiceButton} from "./components/ChoiceButton";
import {Config, defaultConfig} from "./Config";
import {ScriptManager, ScriptFunction} from "./ScriptManager";

export class Engine {

  private game: g.Game;
  private static scriptManager = new ScriptManager();
  private static _config = defaultConfig;

  constructor(game: g.Game) {
    this.game = game;

    Engine.scriptManager.register("image", Engine.image);
    Engine.scriptManager.register("jump", Engine.jump);
    Engine.scriptManager.register("choice", Engine.choice);
  }

  set config(value: Config) {
    Engine._config = value;
  }

  start(scenario?: Scenario): void {

    const s = scenario ? scenario : Scenario.load();

    const scene = new Scene({
      game: this.game,
      scenario,
      scriptManager: Engine.scriptManager,
      config: Engine.config
    });
    this.game.pushScene(scene);
  }

  script(name: string, f: ScriptFunction) {
    Engine.scriptManager.register(name, f);
  }

  private static get config() {
    return Engine._config;
  }

  private static image(scene: Scene, image: Image) {
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
    if(image.x) {
      sprite.x = image.x;
    }
    if(image.y) {
      sprite.y = image.y;
    }
    sprite.invalidate();
    scene.appendE(image.layer, sprite);
  }

  private static jump(scene: Scene, data: Jump) {
    const game = scene.game;
    if(scene.source.update(data.label)) {
      game.pushScene(new Scene({
        game,
        scenario: scene.source,
        scriptManager: Engine.scriptManager,
        config: Engine.config
      }));
      } else {
        // TODO: 続行不可能としてタイトルに戻る?
        game.logger.warn("scene not found:" + data.label);
      }
  }

  private static choice(scene: Scene, items: Choice[]) {
    scene.disableMessageWindowTrigger();
    const game = scene.game;
    const count = items.length;
    const baseWidth = game.width / 4;
    const height = 32;
    const space = 10;
    const baseY = (game.height / 3 * 2 - height * count - space * (count - 1)) / 2;
    items.forEach((choice: Choice, i: number) => {
      let button = new ChoiceButton({
        scene,
        width: baseWidth * 3,
        height,
        config: Engine.config,
        choice
      });
      button.click.addOnce(() => {
        scene.enableMessageWindowTrigger();
        this.scriptManager.call(scene, choice);
      });
      button.setPosition(baseWidth / 2, baseY + (height + space) * i);
      scene.appendE("choice", button);
    });
  }
}
