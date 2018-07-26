"use strict";
import {LayerConfig, GameError} from "@cowlick/core";

export class LayerGroup {
  private scene: g.Scene;
  private root: g.E;
  private group: Map<string, g.E>;

  constructor(scene: g.Scene) {
    this.scene = scene;
    this.root = new g.E({
      scene
    });
    this.scene.append(this.root);
    this.group = new Map<string, g.Pane>();
  }

  append(e: g.E, config: LayerConfig) {
    let layer = this.group.get(config.name);
    if (layer) {
      layer.append(e);
    } else {
      layer = new g.E({
        scene: this.scene,
        width: this.scene.game.width,
        height: this.scene.game.height,
        x: 0,
        y: 0,
        opacity: config.opacity
      });
      layer.append(e);
      this.root.append(layer);
      this.group.set(config.name, layer);
    }
  }

  remove(name: string) {
    const layer = this.group.get(name);
    if (layer) {
      if (this.group.delete(name)) {
        if (layer.destroyed() === false) {
          layer.destroy();
        }
      }
    }
  }

  applyConfig(config: LayerConfig) {
    this.evaluate(config.name, (layer: g.E) => {
      if (config.visible !== undefined) {
        if (config.visible) {
          layer.show();
        } else {
          layer.hide();
        }
      }
      let changed = false;
      if (config.opacity !== undefined) {
        layer.opacity = config.opacity;
        changed = true;
      }
      if (config.x !== undefined) {
        layer.x = config.x;
        changed = true;
      }
      if (config.y !== undefined) {
        layer.y = config.y;
        changed = true;
      }
      if (changed) {
        layer.modified();
      }
    });
  }

  top(name: string) {
    const layer = this.group.get(name);
    if (layer) {
      this.root.append(layer);
    }
  }

  evaluate(name: string, f: (e: g.E) => void) {
    const layer = this.group.get(name);
    if (layer) {
      f(layer);
    } else {
      throw new GameError("layer not found", {name});
    }
  }
}
