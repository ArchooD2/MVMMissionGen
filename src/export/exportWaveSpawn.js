import { exportBot, formatPopValue, indent } from "./exportBot.js";
import { exportTank } from "./exportTank.js";

export function exportWaveSpawn(waveSpawn, bot, indentLevel = 0) {
  const blockIndent = indent(indentLevel);
  const fieldIndent = indent(indentLevel + 1);
  const lines = [`${blockIndent}WaveSpawn`, `${blockIndent}{`];
  const pushField = (key, value) => {
    if (value !== "" && value !== undefined && value !== null) {
      lines.push(`${fieldIndent}${key} ${formatPopValue(value)}`);
    }
  };

  pushField("Name", waveSpawn.name);
  if (waveSpawn.spawnerType !== "Tank") {
    pushField("Where", waveSpawn.where);
  }
  pushField("TotalCount", waveSpawn.totalCount);
  pushField("MaxActive", waveSpawn.maxActive);
  pushField("SpawnCount", waveSpawn.spawnCount);
  pushField("TotalCurrency", waveSpawn.totalCurrency);
  pushField("WaitBeforeStarting", waveSpawn.waitBeforeStarting);
  pushField("WaitBetweenSpawns", waveSpawn.waitBetweenSpawns);

  if (waveSpawn.support) {
    pushField("Support", 1);
  }

  if (waveSpawn.randomSpawn) {
    pushField("RandomSpawn", 1);
  }

  if (waveSpawn.spawnerType === "Tank") {
    lines.push(exportTank(waveSpawn.tank, indentLevel + 1));
  } else {
    lines.push(exportBot(bot, indentLevel + 1));
  }

  lines.push(`${blockIndent}}`);
  return lines.join("\n");
}
