import * as assert from "assert";
import {PriorityQueue} from "../src/models/PriorityQueue";

describe("PriorityQueue", () => {
  it("昇順に並ぶ", () => {
    const queue = new PriorityQueue<number>();
    queue.add(1);
    queue.add(0);
    queue.add(3);
    queue.add(6);
    assert.deepEqual([...queue], [0, 1, 3, 6]);
  });

  it("取り出したら空になる", () => {
    const queue = new PriorityQueue<number>();
    queue.add(1);
    [...queue];
    assert(queue.isEmpty());
  });
});
