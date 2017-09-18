"use strict";
import {LayerConfig, Visibility} from "../models/Script";
import {Layer} from "../Constant";

export class LayerGroup {
  private scene: g.Scene;
  private group: Map<string, g.Pane>;

  constructor(scene: g.Scene) {
    this.scene = scene;
    this.group = new Map<string, g.Pane>();
  }

  appendE(e: g.E, config: LayerConfig) {
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

  visible(visibility: Visibility) {
    this.evaluate(
      visibility.layer,
      (layer: g.Pane) => {
        if(visibility.visible) {
          layer.show();
        } else {
          layer.hide();
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
