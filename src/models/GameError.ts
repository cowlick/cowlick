"use strict";

export class GameError extends Error {
  data: any;

  constructor(message: string, target?: any) {
    super(message);
    this.data = target;
  }
}

Object.setPrototypeOf(GameError, Error);