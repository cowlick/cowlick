"use strict";
import {Engine} from "./Engine";
export * from "./models/Scenario";
export * from "./models/Scene";
export * from "./models/Frame";
export * from "./models/Image";
export * from "./models/Script";

export const engine = new Engine(g.game);
