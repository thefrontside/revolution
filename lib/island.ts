import {
  createContext,
  type Operation,
  type Result,
} from "./deps/effection.ts";
import { useBuilder } from "./builder.ts";
import { useObjectURL } from "./object-url.ts";
import { call } from "./deps/effection.ts";

export function* island(
  location: string,
  argument?: unknown,
): Operation<JSX.Element> {
  let result = yield* useIslandModule(location);

  if (result.ok) {
    let { placeholder } = result.value;
    return placeholder(argument);
  } else {
    throw result.error;
  }
}

interface IslandModule {
  operation(): Operation<void>;
  placeholder(argument: unknown): JSX.Element;
}

export const IslandPath = createContext<string>("island-path");

export function* useIslandModule(
  path: string,
): Operation<Result<IslandModule>> {
  let base = yield* IslandPath;

  let builder = yield* useBuilder({
    path: base,
  });

  let bytes = yield* builder.build(path);

  let blob = new Blob([bytes], {
    type: "text/javascript",
  });

  let url = yield* useObjectURL(blob);

  return createIslandModule(yield* call(import(url)));
}

//deno-lint-ignore no-explicit-any
function createIslandModule(mod: any): Result<IslandModule> {
  let { operation, placeholder } = mod;
  return {
    ok: true,
    value: {
      operation,
      placeholder,
    },
  };
}
