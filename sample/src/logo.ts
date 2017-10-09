"use strict";
import * as novel from "../../lib/index";

export const logo = new novel.Scene({
  label: "logo",
  frames: [
    new novel.Frame([
      {
        tag: novel.Tag.layerConfig,
        data: {
          name: novel.Layer.message,
          visible: false
        }
      },
      {
        tag: novel.Tag.layerConfig,
        data: {
          name: novel.Layer.system,
          visible: false
        }
      },
      {
        tag: novel.Tag.image,
        data: {
          assetId: "black",
          layer: {
            name: novel.Layer.background
          }
        }
      },
      {
        tag: novel.Tag.image,
        data: {
          assetId: "cowlick",
          layer: {
            name: "logo",
            opacity: 0,
            x: 256,
            y: 176
          }
        }
      },
      {
        tag: "logo",
        data: {
          layer: "logo",
          duration: 1000,
          wait: 3000
        }
      },
      {
        tag: novel.Tag.click,
        data: {}
      }
    ]),
    new novel.Frame([
      {
        tag: "jump",
        data: {
          label: "title"
        }
      }
    ])
  ]
});
