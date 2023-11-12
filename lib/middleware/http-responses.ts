import type { HTTPMiddleware } from "../types.ts";

import {
  action,
  createContext,
  type Operation,
  suspend,
} from "../deps/effection.ts";

const ResponseContext = createContext<(response: Response) => void>(
  "revolutions.httpResponse",
);

export function* respondNotFound(): Operation<never> {
  let respond = yield* ResponseContext;
  let response = new Response("Not Found", {
    status: 404,
    statusText: "Not Found",
  });
  respond(response);
  yield* suspend();
  throw new Error("This code is unreachable, but TypeScript don't know.");
}

export function httpResponsesMiddleware(): HTTPMiddleware {
  return function* (request, next) {
    try {
      return yield* action<Response>(function* (resolve) {
        yield* ResponseContext.set(resolve);
        resolve(yield* next(request));
      });
    } catch (error) {
      return new Response(error.stack, {
        status: 500,
        statusText: "Internal Server Error",
      });
    }
  };
}
