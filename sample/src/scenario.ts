"use strict";
import {Scenario} from "../../lib/index";
import {logo} from "./logo";
import {title} from "./title";
import {scene0} from "./scene0";
import {scene1} from "./scene1";
import {scene2} from "./scene2";

module.exports = new Scenario([
  logo,
  title,
  scene0,
  scene1,
  scene2
]);
