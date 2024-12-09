import { describe, expect, it } from "../suite.ts";
import {
  concat,
  httpResponsesMiddleware,
  respondNotFound,
  respondRedirect,
} from "../../mod.ts";

describe("http responses middleware", () => {
  it("can short circuit a middleware stack with a 404", function* () {
    let handler = concat(
      httpResponsesMiddleware(),
      function* () {
        return yield* respondNotFound();
      },
    );

    let request = new Request("http://localhost/test.html");

    let response = yield* handler(request, function* () {
      throw new Error(`should not reach here.`);
    });

    expect(response.status).toEqual(404);
  });

  it("can short circuit a middleware stack with a temporary redirect", function* () {
    let handler = concat(
      httpResponsesMiddleware(),
      function* () {
        return yield* respondRedirect("https://localhost/other.html");
      },
    );

    let request = new Request("http://localhost/test.html");

    let response = yield* handler(request, function* () {
      throw new Error(`should not reach here.`);
    });

    expect(response.status).toEqual(307);
    expect(response.headers.get("location")).toEqual(
      "https://localhost/other.html",
    );
  });

  it("can short circuit a middleware stack with a permanent redirect", function* () {
    let handler = concat(
      httpResponsesMiddleware(),
      function* () {
        return yield* respondRedirect("https://localhost/other.html", {
          permanent: true,
        });
      },
    );

    let request = new Request("http://localhost/test.html");

    let response = yield* handler(request, function* () {
      throw new Error(`should not reach here.`);
    });

    expect(response.status).toEqual(308);
    expect(response.headers.get("location")).toEqual(
      "https://localhost/other.html",
    );
  });
});
