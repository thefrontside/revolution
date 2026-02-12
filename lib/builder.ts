import { join } from "@std/path";
import { call, type Operation } from "effection";
import type { BuildResult } from "esbuild";
import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild-deno-loader";

import type { IslandCollection } from "./island.ts";

export interface BuildIslandBootrapOptions {
  collection: IslandCollection;
  islandsDir: string;
}

export function* buildIslandBootstrap(
  options: BuildIslandBootrapOptions,
): Operation<Uint8Array> {
  let { collection, islandsDir } = options;

  let mainPath = import.meta.resolve("./island-main.ts");

  let bootstrap = [
    `const islands = ${JSON.stringify(collection.invocations)};`,
    "const modules = new Map();",
  ];

  let seen = [...collection.seen];

  for (let i = 0; i < seen.length; i++) {
    let name = seen[i];
    bootstrap.push(
      `import * as $${i} from "${join(islandsDir, name)}";`,
      `modules.set(${name}, $${i})`,
    );
  }

  bootstrap.push(
    "\n",
    `import { main } from "${mainPath}";`,
    `export const bootstrap = (dom) => main(dom, islands, modules);`,
    `if (typeof globalThis.document !== "undefined") { await bootstrap(document); }`,
  );

  try {
    let result = yield* call<BuildResult>(esbuild.build({
      plugins: [...denoPlugins({
        configPath: new URL("../deno.json", import.meta.url).pathname,
      })],
      stdin: {
        contents: bootstrap.join("\n"),
        sourcefile: "bootstrap.js",
        resolveDir: ".",
      },
      jsx: "automatic",
      jsxImportSource: "revolution",
      write: false,
      bundle: true,
      format: "esm",
    }));

    if (result.errors.length) {
      throw new Error("esbuild failed", { cause: result });
    } else {
      if (!result.outputFiles) {
        throw new Error("esbuild failed to produce output", {
          cause: result,
        });
      }
      let [output] = result.outputFiles;
      return output.contents;
    }
  } finally {
    esbuild.stop();
  }
}
