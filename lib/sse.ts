import {
  type ServerSentEventMessage,
  ServerSentEventStream,
} from "jsr:@std/http";
import {
  call,
  createChannel,
  type Operation,
  spawn,
} from "./deps/effection.ts";
import { Middleware } from "./types.ts";
import { drive } from "./server.ts";

export function sse<
  T extends ServerSentEventMessage,
  TDone extends ServerSentEventMessage,
>(
  op: (
    request: Request,
    send: (value: T) => Operation<void>,
  ) => Operation<TDone>,
): Middleware<Request, Response> {
  return function* (request: Request, _next) {
    let body = new ServerSentEventStream();

    let response = new Response(body.readable, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      },
    });

    return yield* drive(response, function* () {
      let events = createChannel<T, TDone>();
      yield* spawn(function* () {
        let writer = body.writable.getWriter();
        try {
          let subscription = yield* events;
          let next = yield* subscription.next();
          while (!next.done) {
            yield* call(() => writer.write(next.value));
            next = yield* subscription.next();
          }
          yield* call(() => writer.write(next.value));
        } finally {
          yield* close(writer);
        }
      });

      let result = yield* op(request, events.send);
      yield* events.close(result);
    });
  };
}

function* close(writer: WritableStreamDefaultWriter): Operation<void> {
  try {
    yield* call(() => writer.close());
  } catch (error) {
    if (!error?.message?.match(/stream is closed/)) {
      throw error;
    }
  }
}
