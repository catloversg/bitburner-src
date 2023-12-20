import { readFileSync, writeFileSync } from "node:fs";
import { Engine } from "../src/engine";
import { saveObject } from "../src/SaveObject";
import { Player } from "../src/Player";

const saveFilePath = "input.json";
const outputFilePath = "output.json";

const saveDataString = readFileSync(saveFilePath).toString();
Engine.load(saveDataString);
Player.money = 0;
writeFileSync(outputFilePath, saveObject.getSaveString(true, true));
process.exit(0);
