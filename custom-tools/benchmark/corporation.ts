import { readFileSync } from "node:fs";
import { setTimeout as nodeSetTimeout } from "node:timers/promises";
import { parentPort } from "node:worker_threads";
import { expose } from "comlink";
// @ts-ignore
import nodeEndpoint from "comlink/dist/esm/node-adapter.mjs";

import { CorpEventEmitter } from "../../src/Corporation/Corporation";
import { Player } from "../../src/Player";
import { Terminal } from "../../src/Terminal";
import { Engine } from "../../src/engine";
import { resolveFilePath } from "../../src/Paths/FilePath";
import { hasScriptExtension } from "../../src/Paths/ScriptFilePath";
import { InitData, InvestmentRoundSample } from "./controller";

enum RoundTarget {
  ROUND1 = 420e9,
  ROUND2 = 10e12,
  ROUND3 = Number.MAX_SAFE_INTEGER,
  ROUND4 = Number.MAX_SAFE_INTEGER,
}

export class Corporation {
  private isInitialized = false;

  public async init(data: InitData) {
    if (this.isInitialized) {
      console.error("Script has already been initialized");
      return;
    }
    const saveDataString = readFileSync(data.saveFilePath).toString();
    if (!saveDataString) {
      console.error("Invalid save data");
      return;
    }
    Engine.load(saveDataString);
    Engine.start();

    const home = Player.getHomeComputer();
    data.scripts.forEach(script => {
      const filePath = resolveFilePath(script.fileName)!;
      if (hasScriptExtension(filePath)) {
        home.writeToContentFile(filePath, script.content);
      }
    });

    // for (let [scriptFilePath, script] of home.scripts.entries()) {
    //   console.log(`scriptFilePath: `, scriptFilePath);
    //   console.log(`script: `, script);
    // }
    this.isInitialized = true;
  }

  public async runCommands(commands: string): Promise<{
    success: boolean,
    data: any[];
  }> {
    return new Promise(async (resolve, reject) => {
      if (!this.isInitialized) {
        reject("Script has not been initialized");
        return;
      }
      let round = 0;
      if (commands.includes("--round1")) {
        round = 1;
      } else if (commands.includes("--round2")) {
        round = 2;
      } else if (commands.includes("--round3")) {
        round = 3;
      } else if (commands.includes("--round4")) {
        round = 4;
      }
      if (!Player.corporation && round != 1) {
        reject("Corporation does not exist");
        return;
      }
      Terminal.executeCommands(commands);
      while (true) {
        await nodeSetTimeout(1000);
        if (Player.corporation) {
          break;
        }
      }

      Terminal.executeCommands("run daemon.js --maintainCorporation;");
      Player.corporation.storedCycles = 1e6;

      let target = 0;
      // Increase maxCycle and maxSampleCount in round > 1
      let balancingMultiplier = 1;
      switch (round) {
        case 1:
          target = RoundTarget.ROUND1;
          break;
        case 2:
          target = RoundTarget.ROUND2;
          balancingMultiplier = 1.5;
          break;
        case 3:
          target = RoundTarget.ROUND3;
          break;
        case 4:
          target = RoundTarget.ROUND4;
          break;
        default:
          target = Number.MAX_SAFE_INTEGER;
          break;
      }
      const maxSampleCount = 20 * balancingMultiplier;
      let samples: InvestmentRoundSample[] = [];
      let reachTarget = false;
      CorpEventEmitter.subscribe(values => {
        if (values !== "StateStart") {
          return;
        }
        let offer = Player.corporation!.getInvestmentOffer().funds;
        if (Player.corporation!.getInvestmentOffer().funds < target * 0.5) {
          return;
        }
        // console.log("Agriculture RP:", Player.corporation!.divisions.get("Agriculture")!.researchPoints);
        // console.log("Chemical RP:", Player.corporation!.divisions.get("Chemical")!.researchPoints);
        // We hit "growth phase"
        if (offer >= target) {
          // Reached target
          reachTarget = true;
        }
        samples.push({
          offer: Player.corporation!.getInvestmentOffer().funds,
          funds: Player.corporation!.funds,
        });
        // Collected enough samples
        if (samples.length === maxSampleCount) {
          resolve({
            success: reachTarget,
            data: samples,
          });
        }
      });
    });
  }
}

expose(new Corporation(), nodeEndpoint(parentPort!));
