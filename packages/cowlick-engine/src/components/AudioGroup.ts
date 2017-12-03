"use strict";
import {Audio, GameError} from "cowlick-core";
import {AudioConfig} from "cowlick-config";

export class AudioGroup {
  private game: g.Game;
  private group: Map<string, g.AudioPlayer[]>;
  private config: AudioConfig;

  constructor(game: g.Game, config: AudioConfig) {
    this.game = game;
    this.group = new Map<string, g.AudioPlayer[]>();
    this.config = config;
  }

  add(name: string, audio: g.AudioPlayer) {
    // TODO: 型変換を消す
    const volume = (this.config as any)[name];
    if (volume) {
      audio.changeVolume(volume);
    }
    let ps = this.group.get(name);
    if (!ps) {
      ps = [];
      this.group.set(name, ps);
    }
    ps.push(audio);
  }

  changeVolume(name: string, volume: number) {
    let ps = this.group.get(name);
    if (ps) {
      for (const player of ps) {
        player.changeVolume(volume);
      }
    }
  }

  remove(audio: Audio) {
    let ps = this.group.get(audio.group);
    if (ps) {
      if (audio.assetId) {
        const i = ps.findIndex(p => p.currentAudio.id === audio.assetId);
        if (i > 0) {
          ps[i].stop();
          ps.splice(i, 1);
        } else {
          throw new GameError("audio not found", audio);
        }
      } else if (this.group.delete(audio.group)) {
        for (const player of ps) {
          player.stop();
        }
      } else {
        throw new GameError("audio group not found", audio);
      }
    }
  }
}
