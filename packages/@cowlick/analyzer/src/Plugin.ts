import * as spawn from "cross-spawn";
import * as msgpack5 from "msgpack5";
const BufferList = require("bl");
import {GeneratedScene} from "./analyzer";

const msgpack = msgpack5();

export class Plugin {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  async exec(input: GeneratedScene[]): Promise<GeneratedScene[]> {
    return new Promise<GeneratedScene[]>((resolve, reject) => {
      let output = new BufferList();
      const cmd = spawn(this.path);
      cmd.stdout.on("data", data => {
        if (typeof data !== "string") {
          output.append(data);
        }
      });
      cmd.on("close", code => {
        if (code === 0) {
          resolve(msgpack.decode(output));
        } else {
          reject(new Error(`Return exit code ${code}: ${this.path}`));
        }
      });
      cmd.stdin.write(msgpack.encode(input));
    });
  }
}
