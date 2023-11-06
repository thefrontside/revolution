import { call, type Operation, resource } from "./deps/effection.ts";

import * as esbuild from "https://deno.land/x/esbuild@v0.19.5/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.2/mod.ts";
import type { BuildResult } from "https://deno.land/x/esbuild@v0.19.5/mod.js";

export interface BuilderOptions {
  path?: string;
}

export interface Builder {
  build(url: string): Operation<Uint8Array>;
}

export function useBuilder(options: BuilderOptions = {}): Operation<Builder> {
  return resource(function* (provide) {
    let { path = Deno.cwd() } = options;
    try {
      yield* provide({
        *build(url: string) {
          let result = yield* call<BuildResult>(esbuild.build({
            plugins: [...denoPlugins({
              configPath: new URL("../deno.json", import.meta.url).pathname,
            })],
            entryPoints: [path + "/" + url],
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
        },
      });
    } finally {
      esbuild.stop();
    }
  });
}
