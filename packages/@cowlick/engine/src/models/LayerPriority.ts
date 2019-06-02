import {PriorityQueue} from "./PriorityQueue";
import {LayerKind} from "@cowlick/core";

export class LayerPriority {
  private priorities: Map<string, number>;
  private minPriority: number;
  private layers: string[];

  constructor(priorities: Map<string, number>) {
    this.priorities = priorities;
    this.minPriority = -1;
    for (const v of this.priorities.values()) {
      this.minPriority = Math.min(this.minPriority, v);
    }
    this.layers = [];
  }

  add(name: string) {
    if (name === LayerKind.backlog) {
      return;
    }
    this.layers = this.layers.filter(n => n !== name);
    this.layers.push(name);
  }

  collect() {
    const queue = new PriorityQueue<[string, number]>(([_, a], [__, b]) => a < b);
    let count = this.minPriority;
    for (const name of this.layers.reverse()) {
      let priority = this.priorities.get(name);
      if (priority === undefined || priority === null || name === LayerKind.message || name === LayerKind.system) {
        priority = count;
        count--;
      }
      queue.add([name, priority]);
    }
    this.layers = [];
    return queue;
  }
}
