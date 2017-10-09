"use strict";
import * as script from "../models/Script";

export function contents(c: any, cs: any[]) {
  "use strict";

  var result = [c];
  if (cs) {
    if (Array.isArray(cs)) {
      cs.forEach(function(c) { result.push(c); });
    } else {
      result.push(cs);
    }
  }
  return result;
}

export function image(assetId: string, layer: string, options: { name: string, value: any }) {
  const result: script.Script = {
    tag: "image",
    data: {
      layer: {
        name: layer
      },
      assetId: assetId
    }
  };
  if(options) {
    if(Array.isArray(options)) {
      options.forEach(function (option) {
        result.data[option.name] = option.value;
      });
    }
  }
  return result;
}

export function text(values: (string | script.RubyText[])[], cm: any) {
  const result: script.Script = {
    tag: "text",
    data: {
      values: values
    }
  };
  if(cm) {
    result.data["clear"] = true;
  }
  return result;
}

function flatten(result: (string | script.RubyText[])[], text: string, values: (string | script.RubyText[])[]) {
  for(const v of values) {
    if(Array.isArray(v)) {
      if(text) {
        result.push(text);
        text = "";
      }
      result.push(v);
    } else {
      text += v;
    }
  }
  return text;
}

export function textBlock(t: (string | script.RubyText[])[], ts: (string | script.RubyText[])[][]) {
  const result: (string | script.RubyText[])[] = [];
  let text = flatten(result, "", t);
  for(const t of ts) {
    text = flatten(result, text, t);
  }
  if(text) {
    result.push(text);
  }
  return result;
}

export function textLine(values: (string | script.RubyText[])[], top: any, end: any) {
  if(top) {
    if(typeof values[0] === "string") {
      values[0] = "\n" + values[0];
    } else {
      values = (["\n"] as (string | script.RubyText[])[]).concat(values);
    }
  }
  if(end) {
    var last = values[values.length - 1];
    if(typeof last === "string") {
      values[values.length - 1] = last + "\n";
    } else {
      values.push("\n");
    }
  }
  const result: (string | script.RubyText[])[] = [];
  let text = flatten(result, "", values);
  if(text) {
    result.push(text);
  }
  return result;
}

export function ruby(rb: string, rt: string): script.RubyText[] {
  return [{
    value: JSON.stringify({
      rb: rb,
      rt: rt
    })
  }];
}

export function playAudio(assetId: string, name: string): script.Script {
  return {
    tag: "playAudio",
    data: {
      assetId: assetId,
      groupName: name
    }
  };
}

export function stopAudio(name: string): script.Script {
  return {
    tag: "stopAudio",
    data: {
      assetId: null,
      groupName: name
    }
  };
}

export function tag(name: string, attrs: { name: string, value: any }[]) {
  const result: script.Script = {
    tag: name,
    data: {}
  }
  for(const attr of attrs) {
    result.data[attr.name] = attr.value;
  }
  return result;
}
