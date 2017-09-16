"use strict";
import {Scenario} from "./models/Scenario";
import {Image} from "./models/Image";
import {Choice} from "./models/Choice";
import {Scene} from "./components/Scene";
import {ChoiceButton} from "./components/ChoiceButton";
import {Config, defaultConfig} from "./Config";

export class Engine {

  private game: g.Game;
  private scripts: Map<string, any>;
  private static _config = defaultConfig;

  constructor(game: g.Game) {
    this.game = game;

    this.scripts = new Map<string, any>();
    this.scripts.set("image", Engine.addImage);
    this.scripts.set("choice", Engine.addChoice);
  }

  set config(value: Config) {
    Engine._config = value;
  }

  start(scenario?: Scenario): void {

    const s = scenario ? scenario : Scenario.load();

    const scene = new Scene({
      game: this.game,
      scenario,
      scripts: this.scripts,
      config: Engine.config
    });
    this.game.pushScene(scene);
  }

  script(name: string, f: (scene: Scene, data: any) => void) {
    this.scripts.set(name, f);
  }

  private static get config() {
    return Engine._config;
  }

  private static addImage(scene: Scene, image: Image) {
    const asset = <g.ImageAsset>scene.assets[image.assetId];
    let sprite: g.Sprite;
    if(image.frames) {
      let s = new g.FrameSprite({
        scene,
        src: asset,
        width: image.width,
        height: image.height
      });
      s.frames = image.frames;
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

  private static addChoice(scene: Scene, items: Choice[]) {
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
        if(scene.source.update(choice.label)) {
        game.pushScene(new Scene({
          game,
          scenario: scene.source,
          scripts: scene.scripts,
          config: Engine.config
        }));
        } else {
          // TODO: 続行不可能としてタイトルに戻る?
          game.logger.warn("scene not found:" + choice.label);
        }
      });
      button.setPosition(baseWidth / 2, baseY + (height + space) * i);
      scene.appendE("choice", button);
    });
  }
}
