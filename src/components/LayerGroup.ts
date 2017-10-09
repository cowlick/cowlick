"use strict";
import {LayerConfig} from "../models/Script";
import {Layer} from "../Constant";

export class LayerGroup {
  private scene: g.Scene;
  private group: Map<string, g.Pane>;

  constructor(scene: g.Scene) {
    this.scene = scene;
    this.group = new Map<string, g.Pane>();
  }

  append(e: g.E, config: LayerConfig) {
    let layer = this.group.get(config.name);
    if(layer) {
      layer.append(e);
    } else {
      layer = new g.Pane({
        scene: this.scene,
        width: this.scene.game.width,
        height: this.scene.game.height,
        x: 0,
        y: 0,
        opacity: config.opacity
      });
      layer.append(e);
      this.scene.append(layer);
      this.group.set(config.name, layer);
    }
  }

  remove(name: string) {
    const layer = this.group.get(name);
    if(layer) {
      if(this.group.delete(name)) {
        this.scene.remove(layer);
        layer.destroy();
      }
    }
  }

  applyConfig(config: LayerConfig) {
    this.evaluate(
      config.name,
      (layer: g.Pane) => {
        if(config.visible !== undefined) {
          if(config.visible) {
            layer.show();
          } else {
            layer.hide();
          }
        }
        if(config.opacity) {
          layer.opacity = config.opacity;
        }
        if(config.x) {
          layer.x = config.x;
        }
        if(config.y) {
          layer.y = config.y;
        }
        if(config.x || config.y || config.opacity) {
          layer.modified();
        }
      }
    );
  }

  top(name: string) {
    this.evaluate(name, (layer) => this.scene.append(layer));
  }

  evaluate(name: string, f: (e: g.Pane) => void) {
    const layer = this.group.get(name);
    if(layer) {
      f(layer);
    } else {
      this.scene.game.logger.warn("layer not found: " + name);
    }
  }
}
