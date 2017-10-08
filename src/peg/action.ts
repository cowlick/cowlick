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

export function textBlock(t: string | script.RubyText[], ts: (string | script.RubyText[])[]) {
  const result: (string | script.RubyText[])[] = [];
  let text = "";
  if(Array.isArray(t)) {
    t.forEach(function(v) {
      if(Array.isArray(v)) {
        result.push(v);
      } else {
        text += v;
      }
    });
  } else {
    text += t;
  }
  if (ts) {
    ts.forEach(function(t) {
      if(Array.isArray(t)) {
        result.push(text);
        text = "";
        result.push(t);
      } else {
        text += t;
      }
    });
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
  const vs: (string | script.RubyText[])[] = [];
  let text = "";
  values.forEach(function(v) {
    if(Array.isArray(v)) {
      vs.push(text);
      text = "";
      vs.push(v);
    } else {
      text += v;
    }
  });
  return vs.length === 0 ? text : vs;
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
