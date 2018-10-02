import {Scene} from "./Scene";
import {Script} from "./Script";
import {Tag} from "./Constant";

export interface AssetCollector {
  collectFromScene(scene: Scene): string[];
  collect(scripts: Script[]): string[];
  collectScript(script: Script): string[];
}

export class DefaultAssetCollector implements AssetCollector {
  private assets: Map<string, string[]>;

  constructor() {
    this.assets = new Map<string, string[]>();
  }

  collectFromScene(scene: Scene): string[] {
    const cache = this.assets.get(scene.label);
    if (cache) {
      return cache;
    }

    const xs: string[] = [];
    for (const frame of scene.frames) {
      xs.push(...this.collect(frame.scripts));
    }
    this.assets.set(scene.label, xs);
    return xs;
  }

  collect(scripts: Script[]): string[] {
    const ids: string[] = [];
    for (const s of scripts) {
      ids.push(...this.collectScript(s));
    }
    return ids;
  }

  collectScript(script: Script): string[] {
    switch (script.tag) {
      case Tag.image:
      case Tag.frameImage:
        return [script.assetId];
      case Tag.pane:
        if (script.backgroundImage) {
          return [script.backgroundImage];
        } else {
          return [];
        }
      case Tag.button:
        return this.collect(script.scripts).concat([script.image.assetId]);
      case Tag.jump:
        return [script.label];
      case Tag.choice:
        const ids: string[] = [];
        for (const c of script.values) {
          ids.push(c.label);
          if (c.path) {
            ids.push(c.path);
          }
        }
        if (script.backgroundImage) {
          ids.push(script.backgroundImage);
        }
        return ids;
      case Tag.link:
        if (script.backgroundImage) {
          return this.collect(script.scripts).concat([script.backgroundImage]);
        } else {
          return this.collect(script.scripts);
        }
      case Tag.playAudio:
        return [script.assetId];
      case Tag.playVideo:
      case Tag.stopVideo:
        return [script.assetId];
      case Tag.evaluate:
        return [script.path];
      case Tag.condition:
        return this.collect(script.scripts).concat([script.path]);
      case Tag.backlog:
        return this.collect(script.scripts);
      case Tag.timeout:
        return this.collect(script.scripts);
      case Tag.ifElse:
        return this.collect(script.conditions).concat(this.collect(script.elseBody));
      case Tag.openSaveScene:
        if (script.base.backgroundImage) {
          return [script.base.backgroundImage];
        } else {
          return [];
        }
      case Tag.click:
        return this.collect(script.scripts);
      case Tag.extension:
        return this.collectFromObject(script.data);
      default:
        return [];
    }
  }

  private collectFromObject(data: any): string[] {
    const ids: string[] = [];
    for (const [k, v] of Object.entries(data)) {
      switch (k) {
        case "assetId":
        case "backgroundImage":
        case "label":
        case "path":
          ids.push(v as string);
          break;
      }
      if (typeof v === "object") {
        ids.push(...this.collectFromObject(v));
      }
    }
    return ids;
  }
}
