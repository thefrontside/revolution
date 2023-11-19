import type {
  HASTElement,
  HASTHtmlNode,
  HASTScriptNode,
  RevolutionPlugin,
} from "../types.ts";
import { CollectedIslands, type IslandModule } from "../island.ts";
import { buildIslandBootstrap } from "../builder.ts";

export interface IslandPluginOptions {
  islandsDir: string;
  modules: Record<string, IslandModule>;
}

export function islandPlugin(options: IslandPluginOptions): RevolutionPlugin {
  let { islandsDir, modules } = options;
  return {
    *http(request, next) {
      yield* CollectedIslands.set({
        nextId: 0,
        seen: new Set(),
        modules,
        invocations: {},
      });
      return yield* next(request);
    },
    *html(request, next) {
      let html = yield* next(request);
      let collection = yield* CollectedIslands;
      let bytes = yield* buildIslandBootstrap({
        collection,
        islandsDir,
      });
      let value = new TextDecoder().decode(bytes);

      let script = {
        type: "element",
        tagName: "script",
        properties: {
          "type": "module",
        },
        children: [{
          type: "text",
          value,
        }],
      } satisfies HASTScriptNode;

      return appendToBody(html, script);
    },
  };
}

function appendToBody(html: HASTHtmlNode, node: HASTElement): HASTHtmlNode {
  for (let child of html.children) {
    if (child.type === "element" && child.tagName === "body") {
      child.children.push(node);
      return html;
    }
  }
  throw new Error(`malformed html, no <body> element found`);
}
