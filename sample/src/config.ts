"use strict";
import * as novel from "../../lib/index";

const maxSaveCount = novel.defaultConfig.system.maxSaveCount;
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

const config: novel.Config = {
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
          x: 310,
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
          x: 420,
          y: 450,
          text: "メニュー2",
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
          text: "ログ",
          scripts: [
            {
              tag: novel.Tag.backlog,
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
  system: novel.defaultConfig.system,
  audio: novel.defaultConfig.audio
};

module.exports = config;
