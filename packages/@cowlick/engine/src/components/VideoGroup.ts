import {Video, GameError} from "@cowlick/core";

export class VideoGroup {
  private scene: g.Scene;
  private assets: g.VideoAsset[];

  constructor(scene: g.Scene) {
    this.scene = scene;
    this.assets = [];
  }

  add(video: Video) {
    const asset = this.scene.assets[video.assetId] as g.VideoAsset;
    this.assets.push(asset);
    return asset.play();
  }

  remove(video: Video) {
    const i = this.assets.findIndex(asset => asset.id === video.assetId);
    if (i > 0) {
      const asset = this.assets[i];
      asset.stop();
      asset.destroy();
      this.assets.splice(i, 1);
    } else {
      throw new GameError("video not found", video);
    }
  }
}
