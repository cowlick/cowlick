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

function text(t, ts) {
  var result = t;
  if (ts) {
    if (Array.isArray(ts)) {
      ts.forEach(function(t) { result += t; });
    } else {
      result + ts;
    }
  }
  return {
    tag: "text",
    data: {
      values: [ result ]
    }
  };
}

module.exports = {
  contents: contents,
  image: image,
  text: text
};
