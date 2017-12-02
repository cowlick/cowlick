"use strict";
import * as novel from "cowlick-core";

const saveLoadPane: novel.Pane = {
  layer: {
    name: novel.Layer.system,
    x: 10,
    y: 10
  },
  width: g.game.width - 60,
  height: 30,
  backgroundImage: "pane",
  padding: 4,
  backgroundEffector: {
    borderWidth: 4
  }
};

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
            name: novel.Layer.system,
            x: 310,
            y: 450
          },
          width: 100,
          height: 24,
          text: "セーブ",
          scripts: [
            {
              tag: novel.Tag.openSaveScene,
              data: {
                vertical: 10,
                horizontal: 1,
                button: novel.Position.Top,
                padding: 10,
                base: saveLoadPane
              }
            }
          ]
        }
      },
      {
        tag: novel.Tag.link,
        data: {
          layer: {
            name: novel.Layer.system,
            x: 420,
            y: 450
          },
          width: 100,
          height: 24,
          text: "ロード",
          scripts: [
            {
              tag: novel.Tag.openLoadScene,
              data: {
                vertical: 10,
                horizontal: 1,
                button: novel.Position.Top,
                padding: 10,
                base: saveLoadPane
              }
            }
          ]
        }
      },
      {
        tag: novel.Tag.link,
        data: {
          layer: {
            name: novel.Layer.system,
            x: 530,
            y: 450
          },
          width: 100,
          height: 24,
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
                        y: 10
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
    ]
  },
  font: {
    list: [
      new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
      })
    ],
    color: "white",
    alreadyReadColor: "#4444FF"
  },
  system: novel.defaultConfig.system,
  audio: novel.defaultConfig.audio
};

module.exports = config;
