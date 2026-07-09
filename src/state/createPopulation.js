import { findMap, maps } from "../data/maps.js";

export function createPopulation(overrides = {}) {
  const mapId = overrides.mapId ?? maps[1]?.id ?? "";
  const selectedMap = findMap(mapId);

  return {
    rootName: overrides.rootName ?? "WaveSchedule",
    mapId,
    startingCurrency: normalizeTextValue(overrides.startingCurrency ?? selectedMap?.defaultStartingCurrency ?? 400),
    respawnWaveTime: normalizeTextValue(overrides.respawnWaveTime ?? selectedMap?.defaultRespawnWaveTime ?? 5),
    canBotsAttackWhileInSpawnRoom: overrides.canBotsAttackWhileInSpawnRoom ?? "no",
    advanced: Boolean(overrides.advanced),
    fixedRespawnWaveTime: overrides.fixedRespawnWaveTime ?? Boolean(selectedMap?.fixedRespawnWaveTime),
    eventPopfile: overrides.eventPopfile ?? selectedMap?.eventPopfile ?? "",
    baseFiles: [...(overrides.baseFiles ?? ["robot_giant.pop", "robot_standard.pop"])],
  };
}

export function updatePopulation(population, patch) {
  return createPopulation({
    ...population,
    ...patch,
  });
}

export function applyMapDefaults(population, mapId) {
  const selectedMap = findMap(mapId);
  return updatePopulation(population, {
    mapId,
    startingCurrency: selectedMap?.defaultStartingCurrency ?? population.startingCurrency,
    respawnWaveTime: selectedMap?.defaultRespawnWaveTime ?? population.respawnWaveTime,
    fixedRespawnWaveTime: Boolean(selectedMap?.fixedRespawnWaveTime),
    eventPopfile: selectedMap?.eventPopfile ?? "",
  });
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
