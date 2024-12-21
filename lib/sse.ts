import {
  type ServerSentEventMessage,
  ServerSentEventStream,
} from "jsr:@std/http";
import {
  call,
  createChannel,
  each,
  type Operation,
  spawn,
} from "effection";
import type { Middleware } from "./types.ts";
import { drive } from "./server.ts";

export interface SSEDriverOptions<T extends ServerSentEventMessage> {
  request: Request;
  send(value: T): Operation<void>;
}

export function sse<
  T extends ServerSentEventMessage,
  TDone extends ServerSentEventMessage,
>(
  op: (options: SSEDriverOptions<T>) => Operation<TDone>,
): Middleware<Request, Response> {
  return function* (request: Request) {
    let body = new ServerSentEventStream();

    let response = new Response(body.readable, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      },
    });

    return yield* drive(response, function* () {
      let writer = body.writable.getWriter();

      let write = (message: ServerSentEventMessage) =>
        call(() => writer.write(message));

      let messages = createChannel<T, never>();

      yield* spawn(function* () {
        for (let message of yield* each(messages)) {
          yield* write(message);
          yield* each.next();
        }
      });

      try {
        let result = yield* op({ request, send: messages.send });
        yield* write(result);
      } finally {
        yield* close(writer);
      }
    });
  };
}

function* close(writer: WritableStreamDefaultWriter): Operation<void> {
  try {
    yield* call(() => writer.close());
  } catch (error) {
    if (!(error as Error)?.message?.match(/stream is closed/)) {
      throw error;
    }
  }
}
