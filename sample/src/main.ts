"use strict";
import * as tl from "@akashic-extension/akashic-timeline";
import * as novel from "../../lib/index";

interface Logo {
  layer: string;
  duration: number;
  wait: number;
}

function main() {

  novel.engine.script("noop", (scene, data) => {});
  novel.engine.script("logo", (scene, data: Logo) => {
    scene.transition(
      data.layer,
      (layer) => {
        let timeline = new tl.Timeline(scene);
        timeline.create(layer, {modified: layer.invalidate, destroyed: layer.destroyed})
          .fadeIn(data.duration)
          .wait(data.wait)
          .fadeOut(data.duration)
          .call(() => scene.requestNextFrame());
      }
    );
  });

  novel.engine.config = {
    window: {
      message: {
        layer: {
          name: novel.Layer.message
        },
        width: g.game.width - 20,
        height: g.game.height / 4,
        x: 10,
        y: g.game.height - g.game.height / 4 - 40,
        backgroundImage: "pane",
        padding: 4,
        backgroundEffector: {
          borderWidth: 4
        },
        touchable: true
      },
      system: [
        {
          tag: novel.Tag.choice,
          data: {
            layer: {
              name: novel.Layer.system
            },
            direction: novel.Direction.Horizontal,
            width: 100,
            height: 32,
            x: g.game.width - 220,
            y: g.game.height - 40,
            values: [
              {
                tag: "noop",
                data: {},
                text: "メニュー1"
              },
              {
                tag: "noop",
                data: {},
                text: "メニュー2"
              }
            ]
          }
        }
      ]
    },
    font: {
      color: "white"
    }
  };

  novel.engine.start();
}

module.exports = main;
