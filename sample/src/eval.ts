"use strict";
import {Variables} from "../../lib/index";

function sample(variables: Variables) {
  variables.current.sample = "sample";
}

module.exports = sample;
