import { useAbortSignal } from "../lib/deps/effection.ts";

import { describe, expect, it } from "./suite.ts";
import { createRevolution, HASTElement } from "../mod.ts";

describe("revolution", () => {
  it("responds with 404 when nothing specified", function* () {
    let revolution = createRevolution();

    let { hostname, port } = yield* revolution.start({ port: 8999 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });
    expect(response.status).toEqual(404);
  });

  it("serves JSX", function* () {
    let revolution = createRevolution({
      jsx: [
        function* () {
          return (
            <html>
              <body>Hello World</body>
            </html>
          );
        },
      ],
    });
    let { hostname, port } = yield* revolution.start({ port: 8999 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });
    expect(response.status).toEqual(200);
    expect(yield* response.text()).toEqual(
      "<html><body>Hello World</body></html>",
    );
  });

  it("complains if the JSX returned is not an HTML element", function* () {
    let revolution = createRevolution({
      jsx: [
        function* () {
          return <body>Hello World</body>;
        },
      ],
    });
    let { hostname, port } = yield* revolution.start({ port: 8999 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });

    expect(response.status).toEqual(500);
  });

  it("transforms HTML trees", function* () {
    let revolution = createRevolution({
      jsx: [
        function* () {
          return (
            <html>
              <body>Hello World</body>
            </html>
          );
        },
      ],
      html: [
        function* (request, next) {
          let html = yield* next(request);
          let [body] = html.children;
          (body as HASTElement).children.unshift(
            <div>Banner</div> as HASTElement,
          );
          return html;
        },
      ],
    });
    let { hostname, port } = yield* revolution.start({ port: 8999 });

    let signal = yield* useAbortSignal();

    let response = yield* fetch(`http://${hostname}:${port}`, { signal });

    expect(yield* response.text()).toEqual(
      "<html><body><div>Banner</div>Hello World</body></html>",
    );
  });
});
