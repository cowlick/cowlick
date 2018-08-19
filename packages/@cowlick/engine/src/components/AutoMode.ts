import {BuiltinVariable} from "@cowlick/core";
import {GameScene} from "./GameScene";

export class AutoMode {
  private scene: GameScene;
  private autoIdentifier: g.TimerIdentifier | undefined;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  setTrigger() {
    if (this.autoIdentifier) {
      return;
    }
    this.autoIdentifier = this.scene.body.setTimeout(
      () => {
        this.scene.requestNextFrame();
        this.autoIdentifier = undefined;
      },
      this.scene.gameState.variables.builtin[BuiltinVariable.autoMessageDuration],
      this
    );
  }

  clear() {
    if (this.autoIdentifier) {
      this.scene.body.clearTimeout(this.autoIdentifier);
      this.autoIdentifier = undefined;
    }
  }
}
