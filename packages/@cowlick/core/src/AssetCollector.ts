import {Scene} from "./Scene";
import {Script} from "./Script";
import {Tag} from "./Constant";

export interface AssetCollector {
  collectFromScene(scene: Scene): string[];
  collect(scripts: Script[]): string[];
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
      switch (s.tag) {
        case Tag.image:
        case Tag.frameImage:
          ids.push(s.assetId);
          break;
        case Tag.pane:
          if (s.backgroundImage) {
            ids.push(s.backgroundImage);
          }
          break;
        case Tag.button:
          ids.push(s.image.assetId);
          ids.push(...this.collect(s.scripts));
          break;
        case Tag.jump:
          ids.push(s.label);
          break;
        case Tag.choice:
          for (const c of s.values) {
            ids.push(c.label);
            if (c.path) {
              ids.push(c.path);
            }
          }
          if (s.backgroundImage) {
            ids.push(s.backgroundImage);
          }
          break;
        case Tag.link:
          if (s.backgroundImage) {
            ids.push(s.backgroundImage);
          }
          ids.push(...this.collect(s.scripts));
          break;
        case Tag.playAudio:
          ids.push(s.assetId);
          break;
        case Tag.playVideo:
        case Tag.stopVideo:
          ids.push(s.assetId);
          break;
        case Tag.evaluate:
          ids.push(s.path);
          break;
        case Tag.condition:
          ids.push(s.path);
          ids.push(...this.collect(s.scripts));
          break;
        case Tag.backlog:
          ids.push(...this.collect(s.scripts));
          break;
        case Tag.timeout:
          ids.push(...this.collect(s.scripts));
          break;
        case Tag.ifElse:
          ids.push(...this.collect(s.conditions));
          ids.push(...this.collect(s.elseBody));
          break;
        case Tag.openSaveScene:
          if (s.base.backgroundImage) {
            ids.push(s.base.backgroundImage);
          }
          break;
        case Tag.click:
          ids.push(...this.collect(s.scripts));
          break;
        case Tag.extension:
          ids.push(...this.collectFromObject(s.data));
          break;
        default:
          break;
      }
    }
    return ids;
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
