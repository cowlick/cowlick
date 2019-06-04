import {Image} from "@cowlick/core";
import {Button} from "./Button";
import {createImage} from "./Image";

export class ImageButton extends Button {
  private image: g.Sprite;

  constructor(scene: g.Scene, image: Image) {
    super({
      scene,
      width: 0,
      height: 0
    });

    this.image = createImage(scene, image);
    this.image.x = 0;
    this.image.y = 0;
    this.width = this.image.width / 3;
    this.height = this.image.height;
    this.append(this.image);
  }

  push() {
    this.image.x = -this.image.width / 3;
    this.image.modified();
    super.push();
  }

  unpush() {
    this.image.x = 0;
    this.image.modified();
    super.unpush();
  }

  hover() {
    this.image.x = (-this.image.width / 3) * 2;
    this.image.modified();
    super.unpush();
  }
}
