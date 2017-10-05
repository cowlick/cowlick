"use strict";
import * as al from "@akashic-extension/akashic-label";
import {Config} from "../Config";
import {RubyText, Text} from "../models/Script";

export class Message extends al.Label {

  private index: number;
  private counter: number;
  private original: Text;
  private current: (string | RubyText)[];

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

    this.index = 0;
    this.counter = 0;
    this.original = {
      values: []
    };
    this.current = [];
    this.textAlign = g.TextAlign.Left;
    this.update.add(this.onUpdated, this);
  }

  get finished() {
    return this.index >= this.original.values.length;
  }

  updateText(text: Text) {
    if(text.clear) {
      this.text = "";
      this.original = text;
      this.index = 0;
      this.counter = 0;
      this.setCurrent();
    } else {
      this.original = {
        values: this.original.values.concat(text.values)
      }
    }
  }

  showAll() {
    if(! this.finished) {
      // 自動更新を止めておかないと二重登録されかねない
      this.update.remove(this.onUpdated, this);
      this.text = "";
      for(const t of this.original.values) {
        if(typeof t === "string") {
          this.text += t;
        } else {
          this.text += t[t.length - 1].value;
        }
      }
      this.index = this.original.values.length;
      this.invalidate();
      this.update.add(this.onUpdated, this);
    }
  }

  private onUpdated() {
    if(! this.finished && this.counter >= this.current.length) {
      this.counter = 0;
      this.index++;
      this.setCurrent();
    }
    if(! this.finished) {
      const t = this.current[this.counter];
      if(typeof t === "string") {
        this.text += t;
      } else {
        if(this.counter !== 0) {
          this.text = this.text.substring(0, this.text.length - t.value.length);
        }
        this.text += t.value;
      }
      this.invalidate();
      this.counter++;
    }
  }

  private setCurrent() {
    const ts = this.original.values[this.index];
    if(typeof ts === "string") {
      this.current = ts.split(/.*?/);
    } else {
      this.current = ts;
    }
  }
}
