import type { HTTPMiddleware } from "../types.ts";

import { action, createContext, type Operation, suspend } from "effection";

const ResponseContext = createContext<(response: Response) => void>(
  "revolutions.httpResponse",
);

export function* respondNotFound(): Operation<never> {
  let respond = yield* ResponseContext.expect();
  let response = new Response("Not Found", {
    status: 404,
    statusText: "Not Found",
  });
  respond(response);
  yield* suspend();
  throw new Error("This code is unreachable, but TypeScript don't know.");
}

export interface RedirectOptions {
  permanent?: boolean;
}

export function* respondRedirect(
  url: string | URL,
  options: RedirectOptions = {},
): Operation<never> {
  let status = options.permanent ? 308 : 307;
  let respond = yield* ResponseContext.expect();
  respond(Response.redirect(url, status));
  yield* suspend();
  throw new Error("This code is unreachable, but TypeScript don't know.");
}

export function httpResponsesMiddleware(): HTTPMiddleware {
  return function* httpResponses(request, next): Operation<Response> {
    try {
      return yield* action<Response>(function* (resolve) {
        yield* ResponseContext.set(resolve);
        resolve(yield* next(request));
      });
    } catch (error) {
      return new Response((error as Error).stack, {
        status: 500,
        statusText: "Internal Server Error",
      });
    }
  };
}
