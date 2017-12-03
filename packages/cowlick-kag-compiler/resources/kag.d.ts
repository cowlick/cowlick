import {Frame} from "cowlick-analyzer";

export interface Result {
  frames: Frame[];
  dependencies: string[];
}

export function parse(input: string): Result;

export interface Location {
  start: {
    offset: number;
    line: number;
    column: number;
  };
  end: {
    offset: number;
    line: number;
    column: number;
  };
}

export class SyntaxError {
  expected: any[];
  found: any;
  name: string;
  message: string;
  location: Location;
}
