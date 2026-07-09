import { createTank } from "./createTank.js";

export function createWaveSpawn(overrides = {}) {
  return {
    name: overrides.name ?? "",
    spawnerType: overrides.spawnerType ?? "TFBot",
    where: overrides.where ?? "spawnbot",
    totalCount: normalizeTextValue(overrides.totalCount ?? "12"),
    maxActive: normalizeTextValue(overrides.maxActive ?? "6"),
    spawnCount: normalizeTextValue(overrides.spawnCount ?? "3"),
    totalCurrency: normalizeTextValue(overrides.totalCurrency ?? "100"),
    waitBeforeStarting: normalizeTextValue(overrides.waitBeforeStarting ?? "0"),
    waitBetweenSpawns: normalizeTextValue(overrides.waitBetweenSpawns ?? "5"),
    support: Boolean(overrides.support),
    randomSpawn: Boolean(overrides.randomSpawn),
    tank: createTank(overrides.tank ?? {}),
  };
}

export function updateWaveSpawn(waveSpawn, patch) {
  return createWaveSpawn({
    ...waveSpawn,
    ...patch,
  });
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
