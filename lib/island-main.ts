import type { Operation, Task } from "./deps/effection.ts";
import type { IslandInvocation, IslandModule } from "./island.ts";

import { all, run, spawn } from "./deps/effection.ts";
import { CurrentDocument, CurrentSlot } from "./render.ts";

export interface IslandMainOptions {
  document: Document;
  islands: Record<string, IslandInvocation>;
  modules: Map<string, IslandModule>;
}

export function main(options: IslandMainOptions): Task<void> {
  let { document } = options;
  return run(function* () {
    yield* CurrentDocument.set(options.document);

    let tasks: Task<void>[] = [];

    for (let slot of islandSlotsOf(document)) {
      let match = slot.name.match(/^island@(.*)$/);
      if (!match) {
        throw new Error(`[assertion] invalid slot match ${slot.name}`);
      }
      let [, id] = match;

      let invocation = options.islands[id];
      if (!invocation) {
        throw new Error(
          `slot found for island@${id}, but no island invocation`,
        );
      }
      const code = options.modules.get(invocation.location);
      if (!code) {
        throw new Error(
          `slot found for island@{id}, but no corresponding module was found`,
        );
      }
      let task = yield* spawn(() =>
        runIsland({
          slot,
          invocation,
          code,
        })
                             );
      tasks.push(task);
    }

    yield* all(tasks);
  });
}

interface RunIslandOptions {
  slot: HTMLSlotElement;
  invocation: IslandInvocation;
  code: IslandModule;
}

function* runIsland(options: RunIslandOptions): Operation<void> {
  yield* CurrentSlot.set(options.slot);
  if (options.code.default) {
    yield* options.code.default(options.invocation.props);
  }
}

function islandSlotsOf(document: Document): Iterable<HTMLSlotElement> {
  let slots = document.querySelectorAll("slot[name^=island]");

  return slots as NodeListOf<HTMLSlotElement>;
}
