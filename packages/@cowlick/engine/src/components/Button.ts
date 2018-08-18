export interface ButtonParameters {
  scene: g.Scene;
  width: number;
  height: number;
  backgroundImage?: string;
  padding?: number;
  backgroundEffector?: {
    borderWidth: number;
  };
}

export class Button extends g.Pane {
  onClick: g.Trigger<Button>;
  private pushed: boolean;

  constructor(params: ButtonParameters) {
    super({
      scene: params.scene,
      width: params.width,
      height: params.height,
      backgroundImage: params.backgroundImage
        ? (params.scene.assets[params.backgroundImage] as g.ImageAsset)
        : undefined,
      padding: params.padding,
      backgroundEffector: params.backgroundEffector
        ? new g.NinePatchSurfaceEffector(params.scene.game, params.backgroundEffector.borderWidth)
        : undefined
    });
    this.touchable = true;
    this.pointDown.add(this.onPointDown, this);
    this.pointMove.add(this.onPointMove, this);
    this.pointUp.add(this.onPointUp, this);
    this.onClick = new g.Trigger<Button>();
    this.pushed = false;
  }

  push(): void {
    this.pushed = true;
    this.modified();
  }

  unpush(): void {
    this.pushed = false;
    this.modified();
  }

  move(x: number | undefined, y: number | undefined) {
    if (x) {
      this.x = x;
    }
    if (y) {
      this.y = y;
    }

    this.modified();
  }

  private onPointDown(_: g.PointDownEvent) {
    if (!this.pushed) {
      this.push();
    }
  }

  private isHover(e: g.PointMoveEvent) {
    let p = {
      x: e.point.x + e.startDelta.x,
      y: e.point.y + e.startDelta.y
    };
    if (p.x < 0 || p.y < 0) return false;
    if (p.x >= this.width || p.y >= this.height) return false;
    return true;
  }

  private onPointMove(e: g.PointMoveEvent) {
    let hover = this.isHover(e);
    if (this.pushed && !hover) {
      this.unpush();
    } else if (!this.pushed && hover) {
      this.push();
    }
  }

  private onPointUp(_: g.PointUpEvent) {
    if (this.pushed) {
      this.onClick.fire(this);
      this.unpush();
    }
  }
}
