export function parse(input: string): any;

export interface Location {
  start:{
      offset: number,
      line: number,
      column: number
  }
  end: {
      offset: number,
      line: number,
      column: number
  }
}

export class SyntaxError {
  expected: any[];
  found: any;
  name: string;
  message: string;
  location: Location;
}
