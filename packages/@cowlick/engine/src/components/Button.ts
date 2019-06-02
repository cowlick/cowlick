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

const enum ButtonState {
  Inactive,
  Hover,
  Pushed
}

export class Button extends g.Pane {
  private onClick: g.Trigger<Button> | null;
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
    this.onClick = null;
    this.buttonState = ButtonState.Inactive;
  }

  get click(): g.Trigger<Button> {
    if (!this.onClick) {
      this.onClick = new g.Trigger<Button>();
    }
    return this.onClick;
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

  destroy() {
    if (this.onClick) {
      this.onClick.destroy();
      this.onClick = null;
    }
    super.destroy();
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
      this.unpush();
      if (this.onClick) {
        this.onClick.fire(this);
      }
    }
  }
}
