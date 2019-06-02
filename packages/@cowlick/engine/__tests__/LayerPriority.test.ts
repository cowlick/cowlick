import "@xnv/headless-akashic/polyfill";
import * as assert from "assert";
import {LayerKind} from "@cowlick/core";
import {LayerPriority} from "../src/models/LayerPriority";

describe("LayerPriority", () => {
  it("未登録の場合は追加順", () => {
    const priority = new LayerPriority(new Map<string, number>());
    priority.add("test0");
    priority.add("test1");
    priority.add(LayerKind.message);
    priority.add(LayerKind.system);
    assert.deepEqual(
      [...priority.collect()],
      [["test0", -4], ["test1", -3], [LayerKind.message, -2], [LayerKind.system, -1]]
    );
  });

  it("登録されている場合はプライオリティに従う", () => {
    const priority = new LayerPriority(new Map<string, number>([["test0", 1], ["test1", 0]]));
    priority.add("test1");
    priority.add(LayerKind.message);
    priority.add(LayerKind.system);
    priority.add("test0");
    assert.deepEqual(
      [...priority.collect()],
      [[LayerKind.message, -2], [LayerKind.system, -1], ["test1", 0], ["test0", 1]]
    );
  });

  it("backlogは無視される", () => {
    const priority = new LayerPriority(new Map<string, number>());
    priority.add(LayerKind.message);
    priority.add(LayerKind.system);
    priority.add(LayerKind.backlog);
    assert.deepEqual([...priority.collect()], [[LayerKind.message, -2], [LayerKind.system, -1]]);
  });
});
