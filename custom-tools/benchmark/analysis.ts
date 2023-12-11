import { readFileSync } from "fs";
import fg from "fast-glob";
import { InvestmentRoundSample } from "./controller";

function median(numbers: number[]) {
  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function benchmarkInvestmentRound() {
  const processedData: InvestmentRoundSample[] = [];
  for (const file of fg.sync(["./dist-esbuild/benchmark/data/*.json"])) {
    const dataString = readFileSync(file).toString();
    const data = JSON.parse(dataString);
    processedData.push(...data.processedData);
  }
  processedData.sort((a, b) => {
    return a.offer - b.offer;
  });
  for (const item of processedData) {
    console.log(item);
  }
  console.log(`processedData.length: ${processedData.length}`);

  const analyticalData: number[] = processedData.map((value): number => {
    return value.offer;
  });
  const sum = analyticalData.reduce((sum, current) => sum = sum + current, 0);
  console.log(`Mean: ${(sum / analyticalData.length).toLocaleString()}`);
  console.log(`Median: ${median(analyticalData).toLocaleString()}`);
}

benchmarkInvestmentRound();
