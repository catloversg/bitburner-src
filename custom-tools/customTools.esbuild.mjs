import { readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { exit } from "node:process";
import arg from "arg";
import fg from "fast-glob";
import esbuild from "esbuild";

// Default format: esm
let scriptExtension = "mjs";
let banner = {
  js: `// BANNER START
const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
// BANNER END`,
};

const args = arg({
  "--format": String,
  "--tools": String,
  "--runtime": String,
});
const { "--format": format = "esm", "--tools": tools = "benchmark", "--runtime": runtime = "deno" } = args;

if (format === "cjs") {
  if (runtime === "deno") {
    console.error("Deno does not support cjs format");
    exit(1);
  }
  scriptExtension = "cjs";
  banner = {};
}
if (runtime === "deno") {
  // Some libraries misidentify runtime environment, e.g., scheduler, file-saver, popper.js. Reasons:
  // - Deno has global "window"
  // - Deno does not have global "global"
  banner.js += `delete globalThis.window;
globalThis.global = globalThis;
`;
  // picomatch/lib/utils.js use process.platform to detect runtime environment. In Deno, process is undefined.
  // Dependency chain: fast-glob -> micromatch -> picomatch
  banner.js += `import * as nodeProcess from "node:process";
globalThis.process = nodeProcess;
`;
}

let entryPoints;
switch (tools) {
  case "benchmark":
    entryPoints = fg.sync(["./benchmark/controller.ts", "./benchmark/corporation.ts"]);
    break;
  case "dataGenerator":
    entryPoints = fg.sync(["./dataGenerator.ts"]);
    break;
  case "saveFileEditor":
    entryPoints = fg.sync(["./saveFileEditor.ts"]);
    break;
  default:
    throw new Error("Invalid tools");
}

const rawLoader = {
  name: "raw-loader",
  setup(build) {
    build.onResolve({ filter: /!!raw-loader!/ }, (args) => {
      return {
        path: args.path,
        pluginData: {
          isAbsolute: isAbsolute(args.path),
          resolveDir: args.resolveDir,
        },
        namespace: "raw-loader",
      };
    });
    build.onLoad({ filter: /!!raw-loader!/, namespace: "raw-loader" }, async (args) => {
      const fullPath = args.pluginData.isAbsolute ? args.path : join(args.pluginData.resolveDir, args.path);
      return {
        contents: await readFile(fullPath.replace(/!!raw-loader!/, "")),
        loader: "text",
      };
    });
  },
};

let outDirectory;
switch (tools) {
  case "benchmark":
    outDirectory = "dist-esbuild/benchmark";
    break;
  case "dataGenerator":
  case "saveFileEditor":
    outDirectory = "dist-esbuild";
    break;
  default:
    throw new Error("Invalid tools");
}
let outExtension = {
  ".js": `.${scriptExtension}`,
};

function buildCustomTools() {
  esbuild
    .build({
      entryPoints: entryPoints,
      outdir: outDirectory,
      bundle: true,
      platform: "node",
      format: format,
      outExtension: outExtension,
      loader: {
        ".png": "file",
      },
      plugins: [rawLoader],
      define: {
        "process.env.NODE_ENV": `"development"`,
        "process.env.HEADLESS_MODE": "true",
        "process.env.RUNTIME_NODE": `${runtime === "node"}`,
        "process.env.RUNTIME_DENO": `${runtime === "deno"}`,
        "process.env.SCRIPT_EXTENSION": `"${scriptExtension}"`,
      },
      banner: banner,
    })
    .catch((reason) => console.error(reason));
}

buildCustomTools();

// import { createRequire } from "node:module";
// const require = createRequire(import.meta.url);
//
// const jsdomPatch = {
//   name: "jsdom-patch",
//   setup(build) {
//     build.onLoad({ filter: /XMLHttpRequest-impl\.js$/ }, async (args) => {
//       let contents = await readFile(args.path, "utf8");
//       contents = contents.replace(
//         "const syncWorkerFile = require.resolve ? require.resolve(\"./xhr-sync-worker.js\") : null;",
//         `const syncWorkerFile = "${require.resolve("jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js")}";`
//           .replaceAll("\\", process.platform === "win32" ? "\\\\" : "\\"),
//       );
//       return { contents, loader: "js" };
//     });
//   },
// };
//
// function buildFakeDomInit() {
//   return esbuild.build({
//     entryPoints: fg.sync(["./benchmark/fakedomInit.ts"]),
//     outdir: outDirectory,
//     write: true,
//     bundle: true,
//     platform: "node",
//     format: format,
//     outExtension: outExtension,
//     plugins: [
//       jsdomPatch,
//     ],
//   });
// }
//
// buildFakeDomInit().then(buildResult => {
//   console.log("fakedomInit build result:", buildResult);
//   if (!buildResult.outputFiles) {
//     return;
//   }
//   for (const outputFile of buildResult.outputFiles) {
//     console.log(outputFile.path, outputFile.hash);
//   }
// }).catch(reason => console.error(reason));
