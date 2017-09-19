"use strict";
import {GameState} from "../../lib/index";

function sample(state: GameState) {
  state.variables.current.sample = "sample";
}

module.exports = sample;
