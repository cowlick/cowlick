"use strict";
import {Scenario} from "./models/Scenario";
import {Image} from "./models/Image";
import {Scene} from "./components/Scene";

export class Engine {

  private game: g.Game;
  private scripts: Map<string, any>;

  constructor(game: g.Game) {
    this.game = game;

    this.scripts = new Map<string, any>();
    this.scripts.set("image", Engine.addImage);
  }

  start(scenario?: Scenario): void {

    const s = scenario ? scenario : Scenario.load();

    const scene = new Scene({
      game: this.game,
      scenario,
      scripts: this.scripts
    });
    this.game.pushScene(scene);
  }

  script(name: string, f: (scene: Scene, data: any) => void) {
    this.scripts.set(name, f);
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
    scene.appendImage(sprite);
  }
}
