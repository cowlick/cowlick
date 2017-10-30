"use strict";
import {Variables} from "cowlick-core";

function sample(variables: Variables) {
  variables.current.sample = "sample";
}

module.exports = sample;
