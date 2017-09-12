"use strict";
import * as al from "@akashic-extension/akashic-label";

export class Label extends al.Label {

  constructor(param: al.LabelParameterObject) {
    // https://github.com/akashic-games/akashic-label/blob/v0.3.3/sample/script/mainScene4.ts#L59
    param.rubyParser = (text: string) => {
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
          }
        } else {
          result.push(text);
          break;
        }
      }
      return result;
    };
    super(param);
  }
}
