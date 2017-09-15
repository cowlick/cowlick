"use strict";
import {Scene} from "./Scene";

export interface ButtonParameters {
  scene: Scene;
  width: number;
  height: number;
}

export class Button extends g.Pane {

  click: g.Trigger<Button>;
  private pushed: boolean;

  constructor(params: ButtonParameters) {
    super({
      scene: params.scene,
      width: params.width,
      height: params.height,
      backgroundImage: <g.ImageAsset>params.scene.assets["button"],
      padding: 4,
      backgroundEffector: new g.NinePatchSurfaceEffector(params.scene.game, 4)
    });
    this.touchable = true;
    this.pointDown.addOnce(this.onPointDown, this);
    this.pointMove.add(this.onPointMove, this);
    this.pointUp.addOnce(this.onPointUp, this);
    this.click = new g.Trigger<Button>();
    this.pushed = false;
  }

  private onPointDown(e: g.PointDownEvent) {
    if (! this.pushed) {
      this.push();
    }
  }

  private push() {
    this.y += 2;
    this.height -= 2;
    this.pushed = true;
    this.modified();
  }

  private unpush() {
    this.y -= 2;
    this.height += 2;
    this.pushed = false;
    this.modified();
  }

  private isHover(e: g.PointMoveEvent) {
    let p = {
      x: e.point.x + e.startDelta.x,
      y: e.point.y + e.startDelta.y
    };
    if (p.x < 0 || p.y < 0)
      return false;
    if (p.x >= this.width || p.y >= this.height)
      return false;
    return true;
  }

  private onPointMove(e: g.PointMoveEvent) {
    let hover = this.isHover(e);
    if (this.pushed && ! hover) {
      this.unpush();
    } else if (! this.pushed && hover) {
      this.push();
    }
  }

  private onPointUp(e: g.PointUpEvent) {
    if (this.pushed) {
      this.click.fire(this);
      this.unpush();
    }
  }
}
