import {serializer} from "./serializer";
import {encodeFrame} from "./encode";

process.stdin.on("data", data => {
  try {
    const program = encodeFrame(serializer.decode(data));
    process.stdout.write(serializer.encode(program).slice());
    process.exit(0);
  } catch (e) {
    if (e instanceof Error) {
      process.stderr.write(e.message);
    }
    process.exit(1);
  }
});
