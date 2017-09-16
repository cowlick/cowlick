"use strict";
import * as al from "@akashic-extension/akashic-label";

export class Label extends al.Label {

  private counter = 0;
  private characters: string[] = [];

  constructor(scene: g.Scene) {
    super({
      scene,
      font: new g.DynamicFont({
        game: scene.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      }),
      text: "",
      fontSize: 18,
      textColor: "white",
      width: scene.game.width - 40,
      x: 20,
      y: 20,
      rubyParser: Label.rubyParser
    });

    this.textAlign = g.TextAlign.Left;
    this.update.add(this.onUpdated, this);
  }

  updateText(text: string) {
    this.text = "";
    this.characters = text.split("");
    this.counter = 0;
  }

  onUpdated() {

    // TODO: ルビを含めていい感じに表示する
    if(this.counter < this.characters.length) {
      this.text += this.characters[this.counter];
      this.invalidate();
      this.counter++;
    }
  }

  // https://github.com/akashic-games/akashic-label/blob/v0.3.3/sample/script/mainScene4.ts#L59
  // The MIT License (MIT)
  // Copyright (c) 2017 DWANGO Co., Ltd.
  static rubyParser(text: string): al.Fragment[] {
    var pattern = /([^(?:<ruby>)]*?)(<ruby>(?:([^(?:<rt>)]*)<rt>(.*?)<\/rt>(?:[^(?:<\\rt>)]*))<\/ruby>)([\s\S]*)/;
    var result: al.Fragment[] = [];
    while (text.length > 0) {
      var parsedText = text.match(pattern);
      if (parsedText !== null) {
        var headStr = parsedText[1];
        var rubyStr = parsedText[2];
        var rubyStrRb = parsedText[3];
        var rubyStrRt = parsedText[4];
        text = parsedText[5];
        if (headStr.length > 0) {
          result.push(headStr);
        }
        if (rubyStrRb !== "" && rubyStrRt !== "") {
          var rubyObj = {
            rb: rubyStrRb,
            rt: rubyStrRt,
            text: rubyStr
          };
          result.push(rubyObj);
        } else {
          // none
        }
      } else {
        result.push(text);
        break;
      }
    }
    return result;
  }
}
