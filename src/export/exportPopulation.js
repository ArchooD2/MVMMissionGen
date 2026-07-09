import { findMap } from "../data/maps.js";
import { formatPopValue, indent } from "./exportBot.js";
import { exportMission } from "./exportMission.js";
import { exportWave } from "./exportWave.js";

export function exportPopulation(population, wave, missions = []) {
  const selectedMap = findMap(population.mapId);
  const lines = [];

  for (const baseFile of population.baseFiles) {
    if (baseFile) {
      lines.push(`#base ${baseFile}`);
    }
  }

  if (lines.length > 0) {
    lines.push("");
  }

  const rootName = population.rootName || "WaveSchedule";
  lines.push(rootName, "{");

  const pushField = (key, value) => {
    if (value !== "" && value !== undefined && value !== null) {
      lines.push(`${indent(1)}${key} ${formatPopValue(value)}`);
    }
  };

  pushField("StartingCurrency", population.startingCurrency);
  pushField("RespawnWaveTime", population.respawnWaveTime);
  pushField("CanBotsAttackWhileInSpawnRoom", population.canBotsAttackWhileInSpawnRoom);

  if (population.fixedRespawnWaveTime) {
    pushField("FixedRespawnWaveTime", "Yes");
  }

  pushField("EventPopfile", population.eventPopfile);

  if (population.advanced) {
    pushField("Advanced", 1);
  }

  for (const mission of missions) {
    lines.push("");
    lines.push(exportMission(mission, 1));
  }

  lines.push("");
  lines.push(exportWave(wave, 1, selectedMap));
  lines.push("}");

  return lines.join("\n");
}
