import { useAbortSignal } from "../lib/deps/effection.ts";
import { describe, expect, it } from "./suite.ts";
import { useServer } from "../mod.ts";

describe("server", () => {
  it("can serve", function* () {
    let server = yield* useServer({
      *handler(request) {
        return new Response(yield* request.text());
      },
    });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${server.hostname}:${server.port}`, {
      method: "POST",
      body: "Hello World",
      signal,
    });

    expect(yield* response.text()).toEqual("Hello World");
  });

  it("can serve on a specific port", function* () {
    let { hostname, port } = yield* useServer({
      port: 8999,
      *handler(request) {
        return new Response(yield* request.text());
      },
    });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:8999`, {
      method: "POST",
      body: "Hello World",
      signal,
    });

    expect(port).toEqual(8999);
    expect(yield* response.text()).toEqual("Hello World");
  });
});
