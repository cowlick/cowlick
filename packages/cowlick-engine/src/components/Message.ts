"use strict";
import * as al from "@akashic-extension/akashic-label";
import * as core from "cowlick-core";
import {Config} from "cowlick-config";
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
  private original: core.Text;
  private current: (string | core.Ruby)[];
  private gameState: GameState;
  private config: Config;
  private identifier: g.TimerIdentifier;

  constructor(params: MessageParameters) {
    super(Message.toLabelParameters(params));

    this.index = 0;
    this.counter = 0;
    this.original = {
      values: []
    };
    this.current = [];
    this.gameState = params.gameState;
    this.textAlign = g.TextAlign.Left;
    this.config = params.config;
    this.onFinished = new g.Trigger<string>();
    this.applySpeed();
  }

  get finished() {
    return this.index >= this.original.values.length;
  }

  updateText(text: core.Text, alreadyRead?: boolean) {
    if (this.config.system.alreadyRead && alreadyRead) {
      this.textColor = this.config.font.alreadyReadColor;
    } else {
      this.textColor = this.config.font.color;
    }
    if (text.clear) {
      this.text = "";
      this.original = text;
      this.index = 0;
      this.counter = 0;
    } else {
      this.original = {
        values: this.original.values.concat(text.values)
      };
    }
    this.setCurrent();
    this.applySpeed();
  }

  applySpeed() {
    if (this.identifier) {
      this.removeTimer();
    }
    this.identifier = this.scene.setInterval(
      this.next,
      this.gameState.variables.builtin[core.BuiltinVariable.messageSpeed],
      this
    );
  }

  applyFontSetting() {
    this.fontSize = this.gameState.variables.builtin[core.BuiltinVariable.fontSize];
    this.textColor = this.gameState.variables.builtin[core.BuiltinVariable.fontColor];
    this.invalidate();
  }

  showAll() {
    if (!this.finished) {
      this.removeTimer();
      this.text = "";
      for (const t of this.original.values) {
        if (typeof t === "string") {
          this.text += t;
        } else if (Array.isArray(t)) {
          this.text += t[t.length - 1].value;
        } else {
          const result = this.gameState.getStringValue(t);
          if (result) {
            this.text += result;
          } else {
            throw new core.GameError("変数の取得に失敗しました", t);
          }
        }
      }
      this.index = this.original.values.length;
      this.onFinished.fire(this.text);
      this.invalidate();
    }
  }

  private next() {
    if (!this.finished && this.counter >= this.current.length) {
      this.counter = 0;
      this.index++;
      if (!this.finished) {
        this.setCurrent();
      }
    }
    if (!this.finished) {
      const t = this.current[this.counter];
      if (typeof t === "string") {
        this.text += t;
      } else {
        if (this.counter !== 0) {
          this.text = this.text.substring(0, this.text.length - t.value.length);
        }
        this.text += t.value;
      }
      this.invalidate();
      this.counter++;
    }
    if (this.finished) {
      this.removeTimer();
      this.onFinished.fire(this.text);
    }
  }

  private removeTimer() {
    if (this.identifier) {
      this.scene.clearInterval(this.identifier);
      this.identifier = null;
    }
  }

  private setCurrent() {
    const ts = this.original.values[this.index];
    if (typeof ts === "string") {
      this.current = ts.split(/.*?/);
    } else if (Array.isArray(ts)) {
      this.current = ts;
    } else {
      const result = this.gameState.getStringValue(ts);
      if (result) {
        this.current = result.split(/.*?/);
      } else {
        throw new core.GameError("変数の取得に失敗しました", ts);
      }
    }
  }

  private static toLabelParameters(params: MessageParameters): al.LabelParameterObject {
    const selected = params.gameState.getValue({
      type: core.VariableType.builtin,
      name: core.BuiltinVariable.selectedFont
    });
    const font = params.config.font.list[selected];
    const fontSize = params.gameState.getValue({
      type: core.VariableType.builtin,
      name: core.BuiltinVariable.fontSize
    });
    const textColor = params.gameState.getValue({
      type: core.VariableType.builtin,
      name: core.BuiltinVariable.fontColor
    });
    return {
      scene: params.scene,
      font,
      text: "",
      fontSize,
      textColor,
      width: params.width,
      x: params.x,
      y: params.y
    };
  }
}
