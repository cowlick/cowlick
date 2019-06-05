import * as http from "http";
import {basename} from "path";
import axios from "axios";
import * as msgpack5 from "msgpack5";
import {GeneratedScene} from "./analyzer";

const msgpack = msgpack5();

export class Plugin {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  async exec(input: GeneratedScene[], port: number): Promise<GeneratedScene[]> {
    const server: http.Server = require(this.path);
    server.listen(port);
    try {
      const response = await axios.post(`http://localhost:${port}`, msgpack.encode(input), {
        responseType: "arraybuffer"
      });
      if (response.status !== 200) {
        throw new Error(`"${basename(this.path)}" returned ${response.status}: ${response.statusText}`);
      }
      return msgpack.decode(response.data);
    } finally {
      server.close();
    }
  }
}
