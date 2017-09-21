"use strict";
import * as al from "@akashic-extension/akashic-label";
import {Config} from "../Config";

export class Message extends al.Label {

  private counter = 0;
  private characters: string[] = [];

  constructor(scene: g.Scene, config: Config) {
    super({
      scene,
      font: new g.DynamicFont({
        game: scene.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      }),
      text: "",
      fontSize: 18,
      textColor: config.font.color,
      width: scene.game.width - 40,
      x: config.window.message.x + 20,
      y: config.window.message.y + 20
    });

    this.textAlign = g.TextAlign.Left;
    this.update.add(this.onUpdated, this);
  }

  get finished() {
    return this.counter >= this.characters.length;
  }

  appendText(text: string) {
    this.characters.concat(text.split(""));
  }

  updateText(text: string) {
    this.text = "";
    this.characters = text.split("");
    this.counter = 0;
  }

  showAll() {
    if(! this.finished) {
      // 自動更新を止めておかないと二重登録されかねない
      this.update.remove(this.onUpdated, this);
      this.text += this.characters.slice(this.counter).join("");
      this.counter = this.characters.length;
      this.invalidate();
      this.update.add(this.onUpdated, this);
    }
  }

  private onUpdated() {

    // TODO: ルビを含めていい感じに表示する
    if(! this.finished) {
      this.text += this.characters[this.counter];
      this.invalidate();
      this.counter++;
    }
  }
}
