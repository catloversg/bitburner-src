import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Augmentation, AugmentationCtorParams } from "../src/Augmentation/Augmentation";
import { Augmentations } from "../src/Augmentation/Augmentations";
import { AugmentationName } from "../src/Augmentation/Enums";
import { MaterialInfo } from "../src/Corporation/MaterialInfo";
import { ResearchMap } from "../src/Corporation/ResearchMap";
import { CorpUpgrades } from "../src/Corporation/data/CorporationUpgrades";
import { IndustriesData } from "../src/Corporation/data/IndustryData";
import { FactionName } from "../src/Faction/Enums";
import { createFullRecordFromEntries } from "../src/Types/Record";

function makeOutputDirectory(): string {
  const outputPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "data",
  );
  mkdirSync(outputPath, { recursive: true });
  return outputPath;
}

function generateData(data: unknown, exportVariableName: string, filename: string, customType: string = "") {
  writeFileSync(
    resolve(
      makeOutputDirectory(),
      `${filename}.ts`,
    ),
    `export const ${exportVariableName}${customType} = ${JSON.stringify(data, null, 4)};`,
  );
}

function generateAugmentationsData() {
  // Overwrite UnstableCircadianModulator with default data
  const UnstableCircadianModulatorParams: Omit<AugmentationCtorParams, "name"> = {
    moneyCost: 5e9,
    repCost: 3.625e5,
    info:
      "An experimental nanobot injection. Its unstable nature leads to " +
      "unpredictable results based on your circadian rhythm.",
    factions: [FactionName.SpeakersForTheDead],
  };
  const params = UnstableCircadianModulatorParams as AugmentationCtorParams;
  params.name = AugmentationName.UnstableCircadianModulator;
  Augmentations[AugmentationName.UnstableCircadianModulator] = new Augmentation(params);

  const augmentationsSortedByKey = Object.fromEntries(Object.entries(Augmentations).sort());
  generateData(augmentationsSortedByKey, "AugmentationsData", "AugmentationsData");
}

function generateCorpUpgradesData() {
  generateData(CorpUpgrades, "CorpUpgradesData", "CorpUpgradesData", `: {
    [UpgradeName: string]: {
        "name": string;
        "basePrice": number;
        "priceMult": number;
        "benefit": number;
        "desc": string;
    };
}`,
  );
}

function generateCorpResearchesData() {
  const ResearchMapCopy = createFullRecordFromEntries(Object.entries(ResearchMap));
  delete ResearchMapCopy["sudo.Assist"];
  generateData(ResearchMapCopy, "CorpResearchesData", "CorpResearchesData", `: {
    [ResearchName: string]: {
        "name": string;
        "cost": number;
        "description": string;
        "advertisingMult": number;
        "employeeChaMult": number;
        "employeeCreMult": number;
        "employeeEffMult": number;
        "employeeIntMult": number;
        "productionMult": number;
        "productProductionMult": number;
        "salesMult": number;
        "sciResearchMult": number;
        "storageMult": number;
    };
}`,
  );
}

function generateCorpIndustriesData() {
  generateData(IndustriesData, "CorpIndustriesData", "CorpIndustriesData", `: {
    [IndustryType: string]: {
        "startingCost": number;
        "description": string;
        "product"?: {
            "name": string;
            "verb": string;
            "desc": string;
            "ratingWeights": {
                "quality"?: number;
                "performance"?: number;
                "durability"?: number;
                "reliability"?: number;
                "aesthetics"?: number;
                "features"?: number;
            };
        };
        "recommendStarting": boolean;
        "realEstateFactor"?: number;
        "scienceFactor": number;
        "hardwareFactor"?: number;
        "robotFactor"?: number;
        "aiCoreFactor": number;
        "advertisingFactor": number;
        "requiredMaterials": {
            [MaterialName: string]: number;
        };
        "producedMaterials"?: string[];
        "makesMaterials": boolean;
        "makesProducts": boolean;
    };
}`,
  );
}

function generateCorpMaterialsData() {
  generateData(MaterialInfo, "CorpMaterialsData", "CorpMaterialsData", `: {
    [MaterialName: string]: {
        name: string;
        size: number;
        demandBase: number;
        demandRange: [min: number, max: number];
        competitionBase: number;
        competitionRange: [min: number, max: number];
        baseCost: number;
        maxVolatility: number;
        baseMarkup: number;
    };
}`,
  );
}

generateAugmentationsData();
generateCorpUpgradesData();
generateCorpResearchesData();
generateCorpIndustriesData();
generateCorpMaterialsData();
