import { dirname, join, resolve } from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Worker as NodeWorker } from "node:worker_threads";
import fg from "fast-glob";
import { wrap } from "comlink";
// @ts-expect-error import node-adapter.mjs
import nodeEndpoint from "comlink/dist/esm/node-adapter.mjs";
import type { Corporation } from "./corporation";

const saveFilePath = "clean.json";

const scriptFolder = "../../BitburnerScripts/dist";

const scriptExtension = process.env.SCRIPT_EXTENSION;

export interface Script {
  fileName: string;
  content: string;
}

export interface InitData {
  saveFilePath: string;
  scripts: Script[];
}

export interface InvestmentRoundSample {
  offer: number,
  funds: number;
}

const outputPath = resolve(__dirname, `./data/${Date.now()}.json`);
mkdirSync(dirname(outputPath), { recursive: true });

const output: {
  rawData: InvestmentRoundSample[][];
  processedData: InvestmentRoundSample[];
} = {
  rawData: [],
  processedData: [],
};
const maxRun = 1;
const maxWorker = 1;
const outputPerRun: typeof output = {
  rawData: [],
  processedData: [],
};

const scripts: Script[] = [];
fg.sync([fg.convertPathToPattern(join(scriptFolder, "**/*.js"))]).forEach(scriptPath => {
  let content = readFileSync(scriptPath).toString();
  if (content.includes("//# sourceMappingURL")) {
    content = content.substring(0, content.indexOf("//# sourceMappingURL"));
  }
  const fileName = fg.convertPathToPattern(resolve(scriptPath).replace(resolve(scriptFolder), ""));
  scripts.push({
    fileName: fileName,
    content: content,
  });
});
if (scripts.length === 0) {
  throw new Error("Cannot find any scripts");
}

async function run() {
  for (let i = 0; i < maxRun; i++) {
    outputPerRun.rawData = [];
    outputPerRun.processedData = [];
    const workers: NodeWorker[] = [];
    const promises: Promise<void>[] = [];
    for (let j = 0; j < maxWorker; j++) {
      const worker = new NodeWorker(`${resolve(__dirname, `./corporation.${scriptExtension}`)}`);
      workers.push(worker);
      const corporationWorker = wrap<Corporation>(nodeEndpoint(worker));
      promises.push(
        corporationWorker.init(<InitData>{
          type: "Init",
          saveFilePath: saveFilePath,
          scripts: scripts,
        }).then(async () => {
          const result = await corporationWorker.runCommands(
            "run corporation.js --round1 --benchmark",
            // "run corporation.js --round2 --benchmark",
            // "run corporation.js --round3 --benchmark",
          );
          const samples = result.data;
          const bestSample = [...samples]
            .sort((a, b) => b.offer - a.offer)[0];
          outputPerRun.processedData.push(bestSample);
          outputPerRun.rawData.push(samples);
          worker.terminate();
        }).catch(reason => {
          console.error("Error occurred in worker thread:", reason);
          worker.terminate();
        }),
      );
    }
    const promiseSettledResults = await Promise.allSettled(promises);
    promiseSettledResults.forEach(settledResult => {
      if (settledResult.status === "rejected") {
        console.error(settledResult.reason);
      }
    });
    workers.forEach(worker => {
      worker.terminate();
    });
    console.log("Result:", outputPerRun.processedData.map(value => value.offer.toLocaleString()));
    output.rawData.push(...outputPerRun.rawData);
    output.processedData.push(...outputPerRun.processedData);
    writeFileSync(outputPath, JSON.stringify(output));
  }
}

run();
