import type { Slot } from "./types.ts";
import type { Operation, Task } from "./deps/effection.ts";
import type { IslandInvocation, IslandModule } from "./island.ts";

import { run, spawn } from "./deps/effection.ts";
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

    let stack: Boundary[] = [];

    for (let boundary of boundariesOf(document)) {
      if (boundary.end) {
        const top = stack.pop();
        if (!top) {
          throw new Error(
            `found closing tag with no opener: {boundary.node.data}`,
          );
        } else if (boundary.id !== top.id) {
          throw new Error(`mismatched `);
        } else {
          let invocation = options.islands[boundary.id];
          if (!invocation) {
            throw new Error(
              `slot found for island@${boundary.id}, but no island invocation`,
            );
          }
          let code = options.modules.get(invocation.location);
          if (!code) {
            throw new Error(
              `slot found for island@{boundary.id}, but no corresponding module was found`,
            );
          }
          yield* spawn(() =>
            runIsland({
              boundaries: [top, boundary],
              invocation,
              code,
            })
          );
        }
      } else {
        stack.push(boundary);
      }
    }
  });
}

interface RunIslandOptions {
  boundaries: [Boundary, Boundary];
  invocation: IslandInvocation;
  code: IslandModule<unknown>;
}

function* runIsland(options: RunIslandOptions): Operation<void> {
  let [start, end] = options.boundaries;
  let slot: Slot = {
    replace(...nodes) {
      let parent = start.node.parentElement!;
      let next = start.node.nextSibling;
      while (next !== end.node) {
        parent.removeChild(next!);
        next = start.node.nextSibling;
      }
      for (let node of nodes) {
        parent.insertBefore(node, end.node);
      }
    },
  };
  yield* CurrentSlot.set(slot);
  if (options.code.default) {
    yield* options.code.default(options.invocation.props);
  }
}

interface Boundary {
  start: boolean;
  end: boolean;
  id: string;
  node: Node;
}

function matchBoundary(node: Comment): Boundary | void {
  let { data } = node;
  let match = data.match(/^(\/?)island@(\d+)$/);
  if (match) {
    let [, flag, id] = match;
    let end = flag === "/";
    return {
      start: !end,
      end,
      id: id,
      node,
    };
  }
}

const SHOW_COMMENT = 128;

function boundariesOf(document: Document): Iterable<Boundary> {
  return {
    *[Symbol.iterator]() {
      let iterator = document.createNodeIterator(
        document.body,
        SHOW_COMMENT,
      );

      let comment = iterator.nextNode() as Comment | null;
      while (comment) {
        let boundary = matchBoundary(comment);
        if (boundary) {
          yield boundary;
        }
        comment = iterator.nextNode() as Comment | null;
      }
    },
  };
}
