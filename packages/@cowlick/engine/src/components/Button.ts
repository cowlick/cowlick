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

export const enum ButtonState {
  Inactive,
  Hover,
  Pushed
}

export class Button extends g.Pane {
  onClick: g.Trigger<Button>;
  private buttonState: ButtonState;

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
    this.buttonState = ButtonState.Inactive;
  }

  push(): void {
    this.buttonState = ButtonState.Pushed;
    this.modified();
  }

  unpush(): void {
    this.buttonState = ButtonState.Inactive;
    this.modified();
  }

  hover() {
    this.buttonState === ButtonState.Hover;
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
    if (this.buttonState !== ButtonState.Pushed) {
      this.push();
    }
  }

  private isHover(e: g.PointMoveEvent) {
    const p = {
      x: e.point.x + e.startDelta.x,
      y: e.point.y + e.startDelta.y
    };
    if (p.x < 0 || p.y < 0) return false;
    if (p.x >= this.width || p.y >= this.height) return false;
    return true;
  }

  private onPointMove(e: g.PointMoveEvent) {
    const hover = this.isHover(e);
    if (this.buttonState === ButtonState.Pushed && hover === false) {
      this.unpush();
    } else if (this.buttonState === ButtonState.Inactive && hover) {
      this.hover();
    }
  }

  private onPointUp(_: g.PointUpEvent) {
    if (this.buttonState === ButtonState.Pushed) {
      this.onClick.fire(this);
      this.unpush();
    }
  }
}
