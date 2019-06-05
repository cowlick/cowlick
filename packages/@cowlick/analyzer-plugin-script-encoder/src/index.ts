import micro, {buffer, send} from "micro";
import {serializer} from "./serializer";
import {encode} from "./encode";

module.exports = micro(async (req, res) => {
  const buf = await buffer(req, {});
  if (typeof buf === "string") {
    throw new Error("Request body must be buffer.");
  }
  const program = encode(serializer.decode(buf));
  return send(res, 200, serializer.encode(program).slice());
});
