"use strict";
import * as novel from "../../lib/index";

const maxSaveCount = novel.defaultConfig.system.maxSaveCount;
const saveButtons: novel.Script<novel.Link>[] = [];
const loadButtons: novel.Script<novel.Link>[] = [];
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
      text: String(i),
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
      text: String(i),
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
        name: novel.Layer.message,
        x: 10,
        y: g.game.height - g.game.height / 4 - 40
      },
      width: g.game.width - 20,
      height: g.game.height / 4,
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
              data: {
                scripts: [
                  {
                    tag: novel.Tag.pane,
                    data: {
                      layer: {
                        name: novel.Layer.backlog,
                        opacity: 100,
                        x: 10,
                        y: 10,
                      },
                      width: g.game.width - 20,
                      height: g.game.height - 20,
                      backgroundImage: "pane",
                      padding: 4,
                      backgroundEffector: {
                        borderWidth: 4
                      },
                      touchable: true
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ],
    load: loadButtons,
    save: saveButtons
  },
  font: {
    list: [
      new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      })
    ],
    selected: 0,
    color: "white"
  },
  system: novel.defaultConfig.system,
  audio: novel.defaultConfig.audio
};

module.exports = config;
