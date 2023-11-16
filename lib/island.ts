import type { HASTFragment, JSXElement } from "./types.ts";

import { createContext, type Operation } from "./deps/effection.ts";

export const CollectedIslands = createContext<IslandCollection>(
  "revolution.IslandCollection",
);

export interface IslandModule<TArgs extends unknown[] = unknown[]> {
  default?(...args: TArgs): Operation<void>;
  placeholder?(...args: TArgs): JSXElement;
}

export interface IslandCollection {
  nextId: number;
  invocations: Record<string, IslandInvocation>;
  seen: Set<string>;
  modules: Record<string, IslandModule>;
}

export interface IslandInvocation {
  id: string;
  location: string;
  props: Record<string, unknown>;
}

export function* useIsland<T extends Record<string, unknown> = Record<string, never>>(
  location: string,
): Operation<(props: T) => JSXElement> {
  let collection = yield* CollectedIslands;

  let mod = collection.modules[location];
  if (!mod) {
    let error = new Error(`no known island: '${location}'`);
    error.name = "MissingIslandError";
    throw error;
  }

  return (props: T) => {
    let id = String(collection.nextId++);
    collection.seen.add(location);
    collection.invocations[id] = { id, location, props };
    let { placeholder } = mod;

    let slot: HASTFragment = {
      type: "root",
      children: [
        {
          type: "comment",
          value: `island@${id}`,
        },
      ],
    };

    if (placeholder) {
      if (typeof placeholder === "string") {
        slot.children.push({
          type: "text",
          value: placeholder,
        });
      } else if (typeof placeholder === "function") {
        let content = placeholder(props);
        if (content.type === "root") {
          slot.children.push(...content.children);
        } else {
          slot.children.push(content);
        }
      }
    }
    slot.children.push({
      type: "comment",
      value: `/island@${id}`,
    });

    return slot;
  }
}
