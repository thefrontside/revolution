import { build, emptyDir } from "jsr:@deno/dnt@0.41.3";

const outDir = "./build/npm";

await emptyDir(outDir);

let [version] = Deno.args;
if (!version) {
  throw new Error("a version argument is required to build the npm package");
}

await build({
  entryPoints: ["./mod.ts"],
  outDir,
  shims: {
    deno: false,
  },
  test: false,
  typeCheck: false,
  scriptModule: false,
  compilerOptions: {
    lib: ["ESNext", "DOM"],
    target: "ES2020",
    sourceMap: true,
  },
  package: {
    // package.json properties
    name: "@frontside/revolution",
    version,
    description: "After the years of reaction comes revolution",
    license: "ISC",
    author: "engineering@frontside.com",
    repository: {
      type: "git",
      url: "git+https://github.com/thefrontside/revolution.git",
    },
    bugs: {
      url: "https://github.com/thefrontside/revolution/issues",
    },
    engines: {
      node: ">= 18",
    },
    sideEffects: false,
  },
});

await Deno.copyFile("README.md", `${outDir}/README.md`);
