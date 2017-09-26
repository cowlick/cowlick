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

  const maxSaveCount = 100;
  const saveButtons: novel.Script[] = [];
  const loadButtons: novel.Script[] = [];
  for(let i = 0; i < maxSaveCount; i++) {
    saveButtons.push({
      tag: novel.Tag.link,
      data: {
        layer: {
          name: novel.Layer.system
        },
        width: g.game.width - 20,
        height: g.game.height / 11,
        x: 10 ,
        y: 10 + g.game.height / 11 * i,
        backgroundImage: "pane",
        padding: 4,
        backgroundEffector: {
          borderWidth: 4
        },
        text: i,
        scripts: [
          {
            tag: novel.Tag.save,
            data: {
              index: i
            }
          }
        ]
      }
    });
    loadButtons.push({
      tag: novel.Tag.link,
      data: {
        layer: {
          name: novel.Layer.system
        },
        width: g.game.width - 20,
        height: g.game.height / 11,
        x: 10 ,
        y: 10 + g.game.height / 11 * i,
        backgroundImage: "pane",
        padding: 4,
        backgroundEffector: {
          borderWidth: 4
        },
        text: i,
        scripts: [
          {
            tag: novel.Tag.load,
            data: {
              index: i
            }
          }
        ]
      }
    });
  }

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
          tag: novel.Tag.link,
          data: {
            layer: {
              name: novel.Layer.system
            },
            width: 100,
            height: 24,
            x: 420,
            y: 450,
            text: "メニュー1",
            scripts: [
              {
                tag: "noop",
                data: {}
              }
            ]
          }
        },
        {
          tag: novel.Tag.link,
          data: {
            layer: {
              name: novel.Layer.system
            },
            width: 100,
            height: 24,
            x: 530,
            y: 450,
            text: "メニュー2",
            scripts: [
              {
                tag: "noop",
                data: {}
              }
            ]
          }
        }
      ],
      load: loadButtons,
      save: saveButtons
    },
    font: {
      color: "white"
    },
    system: {
      maxSaveCount
    },
    audio: {
      se: 0.5,
      bgm: 0.5,
      voice: 0.5
    }
  };

  novel.engine.start();
}

module.exports = main;
