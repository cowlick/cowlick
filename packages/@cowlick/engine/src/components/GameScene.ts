import {Storage} from "../models/Storage";
import * as core from "@cowlick/core";
import {Config} from "@cowlick/config";
import {GameState} from "../models/GameState";
import {ScriptManager} from "../scripts/ScriptManager";
import {Message} from "./Message";
import {LayerGroup} from "./LayerGroup";
import {AudioGroup} from "./AudioGroup";
import {VideoGroup} from "./VideoGroup";
import {Scene} from "./Scene";
import {SceneController} from "./SceneController";
import {AutoMode} from "./AutoMode";
import {LayerPriority} from "../models/LayerPriority";

export interface GameSceneParameters {
  scene: g.Scene;
  scenario: core.Scenario;
  scriptManager: ScriptManager;
  config: Config;
  controller: SceneController;
  player: g.Player;
  state: GameState;
}

export class GameScene implements Scene {
  private scene: g.Scene;
  private _message: Message | undefined;
  private scenario: core.Scenario;
  private scriptManager: ScriptManager;
  private layerGroup: LayerGroup;
  private layerPriority: LayerPriority;
  private config: Config;
  private controller: SceneController;
  private audioGroup: AudioGroup;
  private videoGroup: VideoGroup;
  private storage: Storage;
  private player: g.Player;
  private _gameState: GameState;
  private _enabledWindowClick: boolean;
  private autoMode: AutoMode;

  constructor(params: GameSceneParameters) {
    this.scene = params.scene;
    this.layerGroup = new LayerGroup(this.scene);
    this.scriptManager = params.scriptManager;
    this.config = params.config;
    this.layerPriority = new LayerPriority(this.config.window.priority);
    this.controller = params.controller;
    this.audioGroup = new AudioGroup(this.scene, params.config.audio);
    this.videoGroup = new VideoGroup(this.scene);
    this.player = params.player;
    this._gameState = params.state;
    this.scenario = params.scenario;
    this.scenario.onLoaded.add(this.loadFrame, this);
    this._enabledWindowClick = false;

    this.autoMode = new AutoMode(this);

    this._gameState.copyGameVariables();
    this.storage = new Storage({
      storage: this.game.storage,
      player: this.player,
      state: this._gameState
    });
    // ゲーム中にそこそこの頻度で実行されるタイミング、という点からここで保存している
    if (this.config.system.autoSave) {
      this.storage.saveBuiltinVariables();
      this.storage.saveSystemVariables();
    }
  }

  get body(): g.Scene {
    return this.scene;
  }

  get game(): g.Game {
    return this.scene.game;
  }

  get source(): core.Scene {
    return this.scenario.scene;
  }

  get gameState(): GameState {
    return this._gameState;
  }

  get enabledWindowClick(): boolean {
    return this._enabledWindowClick;
  }

  init() {
    this.createMessageLayer();
    this.createSystemLayer();
    this.scenario.load();
  }

  appendLayer(e: g.E, config: core.LayerConfig) {
    this.layerGroup.append(e, config);
    this.layerPriority.add(config.name);
  }

  removeLayer(name: string) {
    this.layerGroup.remove(name);
  }

  updateText(text: core.Text) {
    if (this._message === undefined) {
      throw new core.GameError("GameSceneのメッセージコンポーネントが未初期化です。");
    }
    const scene = this.scenario.scene;
    this._message.updateText(text, this._gameState.isAlreadyRead(scene.label, scene.index));
    this._gameState.markAlreadyRead(scene.label, scene.index);
    this._message.finish.addOnce(t => {
      this.scenario.pushTextLog(t);
      for (const s of this.config.window.message.marker) {
        this.scriptManager.call(this.controller, s);
      }
      this.scriptManager.call(this.controller, {tag: core.Tag.autoMode});
    }, this);
    this.disableWindowClick();
    this.enableWindowClick();
  }

  applyLayerConfig(config: core.LayerConfig) {
    this.layerGroup.applyConfig(config);
  }

  disableWindowClick() {
    this.disableTrigger();
    this._enabledWindowClick = false;
  }

  enableWindowClick() {
    this.layerGroup.evaluate(core.LayerKind.message, layer => {
      if (this._message === undefined) {
        throw new core.GameError("GameSceneのメッセージコンポーネントが未初期化です。");
      }
      layer.touchable = true;
      if (this._message.finished) {
        layer.pointUp.addOnce(this.requestNextFrame, this);
        for (const c of layer.children) {
          c.pointUp.addOnce(this.requestNextFrame, this);
        }
      } else {
        layer.pointUp.addOnce(this.onWindowClick, this);
        for (const c of layer.children) {
          c.pointUp.addOnce(this.onWindowClick, this);
        }
      }
    });
    this._enabledWindowClick = true;
  }

  transition(layer: string, f: (e: g.E) => void) {
    this.layerGroup.evaluate(layer, f);
  }

  requestNextFrame() {
    // 連打対策
    this.disableWindowClick();

    this.scenario.next();
  }

  playAudio(audio: core.PlayAudio) {
    const player = this.audioGroup.add(audio);
    if (audio.group === core.AudioGroup.voice) {
      player.stopped.addOnce(() => {
        this.scriptManager.call(this.controller, {tag: core.Tag.autoMode});
      }, this);
    }
  }

  changeVolume(data: core.ChangeVolume) {
    this.audioGroup.changeVolume(data.groupName, data.volume);
  }

  stopAudio(audio: core.StopAudio) {
    this.audioGroup.remove(audio);
  }

  playVideo(video: core.Video) {
    this.videoGroup.add(video);
  }

  stopVideo(video: core.Video) {
    this.videoGroup.remove(video);
  }

  save(info: core.Save) {
    this.storage.save(info);
  }

  load(index: number): core.SaveData {
    return this.storage.load(index);
  }

  setAutoTrigger() {
    this.autoMode.setTrigger();
  }

  applyMessageSpeed() {
    if (this._message === undefined) {
      throw new core.GameError("GameSceneのメッセージコンポーネントが未初期化です。");
    }
    this._message.applySpeed();
  }

  applyFontSetting() {
    if (this._message === undefined) {
      throw new core.GameError("GameSceneのメッセージコンポーネントが未初期化です。");
    }
    this._message.applyFontSetting();
  }

  private disableTrigger() {
    this.autoMode.clear();
    this.layerGroup.evaluate(core.LayerKind.message, layer => {
      layer.touchable = false;
      layer.pointUp.removeAll();
      for (const c of layer.children) {
        c.pointUp.removeAll();
      }
    });
  }

  private loadFrame(frame: core.Frame) {
    if (frame) {
      this.removeLayers(frame.scripts);
      this.applyScripts(frame.scripts);
    }
    this.layerPriority.add(core.LayerKind.message);
    this.layerPriority.add(core.LayerKind.system);
    for (const kv of this.layerPriority.collect()) {
      const name = kv[0];
      this.layerGroup.evaluate(name, layer => {
        if (name === core.LayerKind.message && layer.touchable === false) {
          return;
        }
        this.layerGroup.top(name);
      });
    }
  }

  private createMessageLayer() {
    this.scriptManager.call(this.controller, {
      tag: core.Tag.pane,
      ...this.config.window.message.ui
    });
    this._message = new Message({
      scene: this.scene,
      config: this.config,
      width: this.game.width - 60,
      x: this.config.window.message.top.x,
      y: this.config.window.message.top.y,
      gameState: this.gameState
    });
    this.layerGroup.append(this._message, {name: core.LayerKind.message});
    this.enableWindowClick();
  }

  private createSystemLayer() {
    for (const s of this.config.window.system) {
      this.scriptManager.call(this.controller, s);
    }
  }

  private removeLayers(scripts: core.Script[]) {
    const names = new Set<string>();
    for (const s of scripts) {
      if ("layer" in s) {
        names.add((s as any).layer);
      }
    }
    names.forEach(name => {
      this.layerGroup.remove(name);
    });
  }

  private applyScripts(scripts: core.Script[]) {
    for (const s of scripts) {
      this.scriptManager.call(this.controller, s);
    }
  }

  private onWindowClick() {
    if (this._message === undefined) {
      throw new core.GameError("GameSceneのメッセージコンポーネントが未初期化です。");
    }
    if (this._enabledWindowClick) {
      this.gameState.setValue(
        {
          type: core.VariableType.builtin,
          name: core.BuiltinVariable.autoMode
        },
        false
      );

      if (this._message.finished) {
        this.requestNextFrame();
      } else {
        this._message.showAll();
        this.enableWindowClick();
      }
    }
  }
}
