"use strict";
import * as al from "@akashic-extension/akashic-label";
import {Config} from "../Config";
import {Ruby, Text} from "../models/Script";
import {GameState} from "../models/GameState";

export interface MessageParameters {
  scene: g.Scene;
  config: Config;
  width: number;
  x: number;
  y: number;
  gameState: GameState;
}

export class Message extends al.Label {

  onFinished: g.Trigger<string>;
  private index: number;
  private counter: number;
  private original: Text;
  private current: (string | Ruby)[];
  private gameState: GameState;

  constructor(params: MessageParameters) {
    super({
      scene: params.scene,
      font: new g.DynamicFont({
        game: params.scene.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      }),
      text: "",
      fontSize: 18,
      textColor: params.config.font.color,
      width: params.width,
      x: params.x,
      y: params.y
    });

    this.index = 0;
    this.counter = 0;
    this.original = {
      values: []
    };
    this.current = [];
    this.gameState = params.gameState;
    this.textAlign = g.TextAlign.Left;
    this.onFinished = new g.Trigger<string>();
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
      };
    }
    this.update.add(this.onUpdated, this);
  }

  showAll() {
    if(! this.finished) {
      this.update.remove(this.onUpdated, this);
      this.text = "";
      for(const t of this.original.values) {
        if(typeof t === "string") {
          this.text += t;
        } else if(Array.isArray(t)) {
          this.text += t[t.length - 1].value;
        } else {
          const result = this.gameState.getStringValue(t);
          if(result) {
            this.text += result;
          } else {
            this.scene.game.logger.warn("変数の取得に失敗しました", t);
          }
        }
      }
      this.index = this.original.values.length;
      this.onFinished.fire(this.text);
      this.invalidate();
    }
  }

  private onUpdated() {
    if(! this.finished && this.counter >= this.current.length) {
      this.counter = 0;
      this.index++;
      if(! this.finished) {
        this.setCurrent();
      }
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
    if(this.finished) {
      this.update.remove(this.onUpdated, this);
      this.onFinished.fire(this.text);
    }
  }

  private setCurrent() {
    const ts = this.original.values[this.index];
    if(typeof ts === "string") {
      this.current = ts.split(/.*?/);
    } else if(Array.isArray(ts)) {
      this.current = ts;
    } else {
      const result = this.gameState.getStringValue(ts);
      if(result) {
        this.current = result.split(/.*?/);
      } else {
        this.scene.game.logger.warn("変数の取得に失敗しました", ts);
      }
    }
  }
}
