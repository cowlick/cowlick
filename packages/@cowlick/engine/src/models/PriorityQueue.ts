export class PriorityQueue<T> implements IterableIterator<T> {
  private array: T[];
  private size: number;
  private compare: (a: T, b: T) => boolean;

  constructor(comparator?: (a: T, b: T) => boolean) {
    this.compare = comparator ? comparator : (a: T, b: T) => a < b;
    this.array = [];
    this.size = 0;
  }

  add(value: T) {
    let i = this.size;
    this.array[this.size] = value;
    this.size += 1;
    let p: number;
    let v: T;
    while (i > 0) {
      p = (i - 1) >> 1;
      v = this.array[p];
      if (!this.compare(value, v)) {
        break;
      }
      this.array[i] = v;
      i = p;
    }
    this.array[i] = value;
  }

  poll(): T | undefined {
    if (this.size === 0) return undefined;
    const answer = this.array[0];
    if (this.size > 1) {
      this.array[0] = this.array[--this.size];
      this.percolateDown(0);
    } else {
      this.size--;
    }
    return answer;
  }

  isEmpty() {
    return this.size === 0;
  }

  public next(): IteratorResult<T> {
    return {
      done: this.isEmpty(),
      value: this.poll() as T
    };
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }

  private percolateDown(i: number) {
    const size = this.size;
    const hsize = this.size >>> 1;
    const v = this.array[i];
    let l: number;
    let r: number;
    let best: T;
    while (i < hsize) {
      l = (i << 1) + 1;
      r = l + 1;
      best = this.array[l];
      if (r < size) {
        if (this.compare(this.array[r], best)) {
          l = r;
          best = this.array[r];
        }
      }
      if (this.compare(best, v) === false) {
        break;
      }
      this.array[i] = best;
      i = l;
    }
    this.array[i] = v;
  }
}
