import { describe, expect, it } from "./suite.ts";
import { createRevolution, sse } from "../mod.ts";
import { call, sleep, suspend } from "../lib/deps/effection.ts";
import { spawn } from "../lib/deps/effection.ts";

describe("streaming responses", () => {
  it("can consume an SSE stream", function* () {
    let revolution = createRevolution({
      app: [
        sse(function* (send) {
          for (let i = 3; i > 0; i--) {
            yield* send({ event: "count", data: JSON.stringify(i) });
            yield* sleep(5);
          }
          return {
            event: "done",
            data: "blastoff!",
          };
        }),
      ],
    });

    let { hostname, port } = yield* revolution.start({ port: 9999 });

    let response = yield* fetch(`http://${hostname}:${port}`);
    let text = yield* response.text();
    expect(text).toEqual(`event:count
data:3

event:count
data:2

event:count
data:1

event:done
data:blastoff!

`);
  });

  it("cancels SSE operations that are terminated by the client", function* () {
    let revolution = createRevolution({
      app: [
        sse(function* () {
          yield* suspend();
          return { event: "never", data: "reached" };
        }),
      ],
    });

    yield* call(function* () {
      let { hostname, port } = yield* revolution.start({ port: 9991 });
      let ac = new AbortController();
      yield* spawn(() =>
        call(() => fetch(`http://${hostname}:${port}`, { signal: ac.signal }))
      );

      yield* sleep(2);
      ac.abort();
    });
  });
});
