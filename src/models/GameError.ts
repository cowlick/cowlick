"use strict";

export class GameError extends Error {
  data: any;

  constructor(message: string, target?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.data = target;
  }
}