"use strict";

function contents(c, cs) {
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

function image(assetId, layer, options) {
  var result = {
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

function text(values, cm) {
  var result = {
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

function textBlock(t, ts) {
  var result = [];
  var text = "";
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

function textLine(values, top, end) {
  if(top) {
    if(typeof values[0] === "string") {
      values[0] = "\n" + values[0];
    } else {
      values = ["\n"].concat(values);
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
  var vs = [];
  var text = "";
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

function ruby(rb, rt) {
  return [{
    value: JSON.stringify({
      rb: rb,
      rt: rt
    })
  }];
}

module.exports = {
  contents: contents,
  image: image,
  text: text,
  textBlock: textBlock,
  textLine: textLine,
  ruby: ruby
};
