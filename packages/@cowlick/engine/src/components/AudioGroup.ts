import {PlayAudio, StopAudio, GameError} from "@cowlick/core";
import {AudioConfig} from "@cowlick/config";

export class AudioGroup {
  private scene: g.Scene;
  private group: Map<string, g.AudioPlayer[]>;
  private config: AudioConfig;

  constructor(scene: g.Scene, config: AudioConfig) {
    this.scene = scene;
    this.group = new Map<string, g.AudioPlayer[]>();
    this.config = config;
  }

  add(audio: PlayAudio) {
    let ps = this.group.get(audio.group);
    if (!ps) {
      ps = [];
      this.group.set(audio.group, ps);
    }
    const player = this.play(audio);
    const volume = (this.config as any)[audio.group];
    if (volume) {
      player.changeVolume(volume);
    }
    ps.push(player);
    return player;
  }

  changeVolume(name: string, volume: number) {
    let ps = this.group.get(name);
    if (ps) {
      for (const player of ps) {
        player.changeVolume(volume);
      }
    }
  }

  remove(audio: StopAudio) {
    let ps = this.group.get(audio.group);
    if (ps) {
      if (this.group.delete(audio.group)) {
        for (const player of ps) {
          player.stop();
        }
        return;
      }
      const i = ps.findIndex(p => p.currentAudio.id === audio.assetId);
      if (i > -1) {
        ps[i].stop();
        ps.splice(i, 1);
      } else {
        throw new GameError("audio not found", audio);
      }
    }
  }

  private play(audio: PlayAudio) {
    const asset = this.scene.assets[audio.assetId] as g.AudioAsset;
    return asset.play();
  }
}
