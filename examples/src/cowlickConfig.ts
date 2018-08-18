import * as novel from "@cowlick/core";
import {Config, defaultConfig} from "@cowlick/config";

const saveLoadPane: novel.Pane = {
  tag: novel.Tag.pane,
  layer: {
    name: novel.LayerKind.system,
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

const size = 18;

const tmpConfig = defaultConfig();

const config: Config = {
  window: {
    message: {
      ui: {
        layer: {
          name: novel.LayerKind.message,
          x: 10,
          y: g.game.height - g.game.height / 4 - 40
        },
        width: g.game.width - 20,
        height: g.game.height / 4 + 10,
        backgroundImage: "pane",
        padding: 4,
        backgroundEffector: {
          borderWidth: 4
        },
        touchable: true
      },
      top: {
        x: 30,
        y: g.game.height - g.game.height / 4 - 30
      },
      marker: []
    },
    system: [
      {
        tag: novel.Tag.link,
        layer: {
          name: novel.LayerKind.system,
          x: 310,
          y: 450
        },
        width: 100,
        height: 24,
        text: "セーブ",
        scripts: [
          {
            tag: novel.Tag.openSaveScene,
            vertical: 10,
            horizontal: 1,
            button: novel.Position.Top,
            padding: 10,
            base: saveLoadPane
          }
        ]
      },
      {
        tag: novel.Tag.link,
        layer: {
          name: novel.LayerKind.system,
          x: 420,
          y: 450
        },
        width: 100,
        height: 24,
        text: "ロード",
        scripts: [
          {
            tag: novel.Tag.openLoadScene,
            vertical: 10,
            horizontal: 1,
            button: novel.Position.Top,
            padding: 10,
            base: saveLoadPane
          }
        ]
      },
      {
        tag: novel.Tag.link,
        layer: {
          name: novel.LayerKind.system,
          x: 530,
          y: 450
        },
        width: 100,
        height: 24,
        text: "ログ",
        scripts: [
          {
            tag: novel.Tag.backlog,
            scripts: [
              {
                tag: novel.Tag.pane,
                layer: {
                  name: novel.LayerKind.backlog,
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
            ]
          }
        ]
      }
    ]
  },
  font: {
    list: [
      new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size
      })
    ],
    color: "white",
    alreadyReadColor: "#4444FF",
    size
  },
  system: tmpConfig.system,
  audio: tmpConfig.audio
};

module.exports = config;
