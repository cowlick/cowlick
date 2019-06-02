export class AlreadyReadChecker {
  private alreadyRead: {
    [label: string]: number[];
  };

  constructor(alreadyRead: any) {
    this.alreadyRead = alreadyRead;
  }

  mark(label: string, frame: number) {
    if (label in this.alreadyRead) {
      const logs = this.alreadyRead[label];
      if (logs.some(f => f === frame) === false) {
        logs.push(frame);
      }
    } else {
      this.alreadyRead[label] = [frame];
    }
  }

  isAlreadyRead(label: string, frame: number) {
    if (label in this.alreadyRead) {
      return this.alreadyRead[label].some(f => f === frame);
    } else {
      return false;
    }
  }
}
