"use strict";
import {Visibility} from "../models/Script";

export class LayerGroup {
  private scene: g.Scene;
  private group: Map<string, g.Pane>;

  constructor(scene: g.Scene) {
    this.scene = scene;
    this.group = new Map<string, g.Pane>();
  }

  appendE(layerName: string, e: g.E) {
    let layer = this.group.get(layerName);
    if(layer) {
      layer.append(e);
    } else {
      layer = new g.Pane({
        scene: this.scene,
        width: this.scene.game.width,
        height: this.scene.game.height,
        x: 0,
        y: 0
      });
      layer.append(e);
      this.scene.append(layer);
      this.group.set(layerName, layer);
    }
  }

  remove(name: string) {
    const layer = this.group.get(name);
    if(this.group.delete(name)) {
      this.scene.remove(layer);
      layer.destroy();
    }
  }

  visible(visibility: Visibility) {
    let layer = this.group.get(visibility.layer);
    if(layer) {
      if(visibility.visible) {
        layer.show();
      } else {
        layer.hide();
      }
    }
  }

  top(name: string) {
    const layer = this.group.get(name);
    if(layer) {
      this.scene.append(layer);
    }
  }
}
