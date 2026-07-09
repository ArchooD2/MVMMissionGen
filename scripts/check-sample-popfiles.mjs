import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { maps } from "../src/data/maps.js";
import { createPopulation } from "../src/state/createPopulation.js";
import { createWave } from "../src/state/createWave.js";
import { exportPopulation } from "../src/export/exportPopulation.js";
import { parsePopText, summarizePopTree } from "../src/import/parsePopText.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sampleRoot = resolve(scriptDir, "../../samples");
const sampleFiles = [
  "mvm_coaltown.pop",
  "mvm_mannworks.pop",
  "mvm_bigrock.pop",
  "mvm_rottenburg.pop",
];

const summaries = [];
for (const fileName of sampleFiles) {
  const text = await readFile(resolve(sampleRoot, fileName), "utf8");
  summaries.push({ fileName, ...summarizePopTree(parsePopText(text)) });
}

const generatedChecks = maps.map((map) => {
  const exported = exportPopulation(createPopulation({ mapId: map.id }), createWave(), []);
  const summary = summarizePopTree(parsePopText(exported));
  return {
    mapId: map.id,
    rootName: summary.rootName,
    hasBaseFiles: summary.baseFiles.includes("robot_giant.pop") && summary.baseFiles.includes("robot_standard.pop"),
    startTarget: summary.firstWaveOutputTargets.StartWaveOutput?.target ?? "",
    doneTarget: summary.firstWaveOutputTargets.DoneOutput?.target ?? "",
    matchesMapOutputs: summary.firstWaveOutputTargets.StartWaveOutput?.target === map.startWaveOutput
      && summary.firstWaveOutputTargets.DoneOutput?.target === map.doneOutput,
  };
});

console.log(JSON.stringify({ samples: summaries, generatedChecks }, null, 2));

