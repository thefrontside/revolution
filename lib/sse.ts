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
} from "./deps/effection.ts";
import { Middleware } from "./types.ts";
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
      let events = createChannel<T, never>();
      try {
        yield* spawn(function* () {
          for (const event of yield* each(events)) {
            yield* call(() => writer.write(event));
            yield* each.next();
          }
          console.log("no more next. write final value");
        });
        let result = yield* op({ request, send: events.send });
        console.log("result returned from handler");
        yield* call(() => writer.write(result));
        console.log("wrote result to stream");
      } finally {
        console.log("closing writer");
        yield* close(writer);
        console.log("channel closed");
      }
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
