// Copyright © 2018, Yves Goergen, http://unclassified.software
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
// associated documentation files (the “Software”), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge, publish, distribute,
// sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or
// substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
// NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const assert = require("assert");
const msgpack = require("../index");

describe("msgpack", () => {
  it("serialize and deserialize", () => {
    testData(-65);
    testData(-11114294967299);
    testData(4294967298);
    testData(new Date(2001, 1 /*Feb*/, 3, 4, 5, 6));
    testData(new Date(2110, 1 /*Feb*/, 3, 4, 5, 6));
    testData(new Date(0x3ffffffff * 1000 + 50));
    testData(new Date(0xfffffffff * 1000 + 50));
    testData(new Uint8Array([1, 2, 3, 200]));
    //testData(new Uint32Array([1, 2, 3, 200000]));
  });
});

const testData = (data) => {
  let dataStr = format(data);
  let bin = msgpack.serialize(data);
  let data2 = msgpack.deserialize(bin);
  let data2Str = format(data2);
  assert(dataStr === data2Str);
};

const format = (value, hexNumbers) => {
  switch (typeof(value)) {
    case "undefined": return "undefined";
    case "boolean": return value ? "true" : "false";
    case "number": return (hexNumbers ? "0x" + padStart(value.toString(16), 2, "0") : value.toString());
    case "string": return JSON.stringify(value);
    case "symbol": return "symbol";
    case "function": return "function";
    case "object":
      if (value === null) return "null";
      if (Array.isArray(value)) {
        return "Array(" + value.length + ") [" + value.map(function (x) { return format(x, hexNumbers); }).reduce(function (a, b) { return a + ", " + b; }) + "]";
      }
      if (value instanceof Date) {
        return "Date " + value.toISOString();
      }
      let className = getClassName(value);
      if (className) {
        if (className.match(/((Int|Uint)(8|16|32)(Clamped)?|Float(32|64))Array$/)) {
          return className + "(" + value.length + ") [" + toArray(value).map(function (x) { return format(x, hexNumbers); }).reduce(function (a, b) { return a + ", " + b; }) + "]";
        }
        return className + "(" + Object.keys(value).length + ") [" + Object.keys(value).map(function (k) { return k + ": " + format(value[k], hexNumbers); }).reduce(function (a, b) { return a + ", " + b; }) + "]";
      }
      return "object";
    default: return typeof(value);
  }

  function getClassName(obj) {
    if (obj.constructor.name) return obj.constructor.name;
    let match = obj.toString().match(/ (\w+)/);
    if (match) return match[1];
    return "?";
  }

  function padStart(str, length, pad) {
    if (str.padStart) return str.padStart(length, pad);
    while (str.length < length) {
      str = pad + str;
    }
    return str;
  }
};

const toArray = (arr) => {
  if (Array.from) return Array.from(arr);
  return [].slice.call(arr);
};
