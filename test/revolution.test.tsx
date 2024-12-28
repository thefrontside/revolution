import { useAbortSignal } from "effection";

import { describe, expect, it } from "./suite.ts";
import {
  createRevolution,
  DELETE,
  GET,
  type HASTElement,
  POST,
  route,
} from "../mod.ts";

describe("revolution", () => {
  it("responds with 404 when nothing specified", function* () {
    let revolution = createRevolution();

    let { hostname, port } = yield* revolution.start({ port: 8999 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });
    expect(response.status).toEqual(404);
  });

  it("matches method-specific routes using middlewares array", function* () {
    let revolution = createRevolution({
      app: [
        route(
          "/healthz",
          GET(function* () {
            return new Response("GET");
          }),
          POST(function* () {
            return new Response("POST");
          }),
          DELETE(function* () {
            return new Response("DELETE");
          }),
        ),
      ],
    });

    let { hostname, port } = yield* revolution.start({ port: 8991 });
    let signal = yield* useAbortSignal();
    let response = yield* fetch(`http://${hostname}:${port}/healthz`, {
      method: "DELETE",
      signal,
    });
    expect(yield* response.text()).toEqual("DELETE");

    response = yield* fetch(`http://${hostname}:${port}/healthz`, {
      method: "POST",
      signal,
    });
    expect(yield* response.text()).toEqual("POST");

    response = yield* fetch(`http://${hostname}:${port}/healthz`, {
      method: "GET",
      signal,
    });
    expect(yield* response.text()).toEqual("GET");
  });

  it("matches method-specific routes in correct order", function* () {
    let revolution = createRevolution({
      app: [
        route(
          "/healthz",
          GET(function* () {
            return new Response("GET");
          }),
          GET(function* () {
            throw new Error("SHOULD NOT HIT THIS");
            // deno-lint-ignore no-unreachable
            return new Response("GET");
          }),
        ),
      ],
    });

    let { hostname, port } = yield* revolution.start({ port: 8993 });
    let signal = yield* useAbortSignal();
    let response = yield* fetch(`http://${hostname}:${port}/healthz`, {
      method: "GET",
      signal,
    });
    expect(yield* response.text()).toEqual("GET");
  });

  it("matches method-specific routes using single middleware", function* () {
    let revolution = createRevolution({
      app: [
        route(
          "/healthz",
          GET(function* () {
            return new Response("GET");
          }),
        ),
        route(
          "/healthz",
          POST(function* () {
            return new Response("POST");
          }),
        ),
        route(
          "/healthz",
          DELETE(function* () {
            return new Response("DELETE");
          }),
        ),
      ],
    });

    let { hostname, port } = yield* revolution.start({ port: 8992 });
    let signal = yield* useAbortSignal();
    let response = yield* fetch(`http://${hostname}:${port}/healthz`, {
      method: "DELETE",
      signal,
    });
    expect(yield* response.text()).toEqual("DELETE");

    response = yield* fetch(`http://${hostname}:${port}/healthz`, {
      method: "POST",
      signal,
    });
    expect(yield* response.text()).toEqual("POST");

    response = yield* fetch(`http://${hostname}:${port}/healthz`, {
      method: "GET",
      signal,
    });
    expect(yield* response.text()).toEqual("GET");
  });

  it("serves JSX", function* () {
    let revolution = createRevolution({
      app: [
        function* () {
          return (
            <html>
              <body>Hello World</body>
            </html>
          );
        },
      ],
    });
    let { hostname, port } = yield* revolution.start({ port: 8997 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });

    expect(response.status).toEqual(200);
    expect(yield* response.text()).toEqual(
      "<!doctype html><html><body>Hello World</body></html>",
    );
  });

  it("complains if the JSX returned is not an HTML element", function* () {
    let revolution = createRevolution({
      app: [
        function* () {
          return <body>Hello World</body>;
        },
      ],
    });
    let { hostname, port } = yield* revolution.start({ port: 8998 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });

    expect(response.status).toEqual(500);
  });

  it("transforms HTML trees", function* () {
    let revolution = createRevolution({
      app: [
        function* () {
          return (
            <html>
              <body>Hello World</body>
            </html>
          );
        },
      ],
      plugins: [
        {
          *html(request, next) {
            let node = yield* next(request);
            let [body] = node.children;
            (body as HASTElement).children.unshift(
              <div>Banner</div> as HASTElement,
            );
            return node;
          },
        },
      ],
    });
    let { hostname, port } = yield* revolution.start({ port: 8999 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });

    expect(yield* response.text()).toEqual(
      "<!doctype html><html><body><div>Banner</div>Hello World</body></html>",
    );
  });
});
