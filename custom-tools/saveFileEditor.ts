import { readFileSync, writeFileSync } from "node:fs";
import { Engine } from "../src/engine";
import { saveObject } from "../src/SaveObject";
import { Player } from "../src/Player";

const saveFilePath = "input.gz";
const outputFilePath = "output.gz";

const saveData = readFileSync(saveFilePath);
await Engine.load(saveData);
Player.money = 0;
writeFileSync(outputFilePath, await saveObject.getSaveData(true, true));
process.exit(0);
