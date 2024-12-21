import { useAbortSignal } from "effection";
import { describe, expect, it } from "./suite.ts";
import { useServer } from "../mod.ts";

describe("server", () => {
  it("can serve", function* () {
    let server = yield* useServer({
      port: 8901,
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
      port: 8900,
      *handler(request) {
        return new Response(yield* request.text());
      },
    });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:8900`, {
      method: "POST",
      body: "Hello World",
      signal,
    });

    expect(port).toEqual(8900);
    expect(yield* response.text()).toEqual("Hello World");
  });
});
