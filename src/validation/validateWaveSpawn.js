import { hasStarterSpawnLocation } from "../data/spawnLocations.js";
import { validateBot } from "./validateBot.js";
import { validateTank } from "./validateTank.js";

export function validateWaveSpawn(waveSpawn, bot, options = {}) {
  const errors = [];
  const warnings = [];
  const allowedSpawnNames = options.spawnNames ?? null;
  const waveSpawnNames = options.waveSpawnNames ?? [];

  if (!waveSpawn.spawnerType) {
    errors.push("Spawner type is required.");
  } else if (!["TFBot", "Tank"].includes(waveSpawn.spawnerType)) {
    errors.push(`Spawner type "${waveSpawn.spawnerType}" is not supported by this milestone.`);
  }

  if (waveSpawn.spawnerType === "Tank") {
    const tankValidation = validateTank(waveSpawn.tank, { tankPaths: options.tankPaths ?? [] });
    for (const error of tankValidation.errors) {
      errors.push(`Tank: ${error}`);
    }
    for (const warning of tankValidation.warnings) {
      warnings.push(`Tank: ${warning}`);
    }
  } else {
    if (!waveSpawn.where) {
      errors.push("Spawn location is required.");
    } else if (allowedSpawnNames && allowedSpawnNames.length > 0 && !allowedSpawnNames.includes(waveSpawn.where)) {
      errors.push(`Spawn location "${waveSpawn.where}" is not listed for the selected map.`);
    } else if (!allowedSpawnNames && !hasStarterSpawnLocation(waveSpawn.where)) {
      warnings.push(`Spawn location "${waveSpawn.where}" is not in the starter spawn list.`);
    }

    if (!bot) {
      errors.push("Bot spawner is missing a bot payload.");
    } else {
      const botValidation = validateBot(bot);
      for (const error of botValidation.errors) {
        errors.push(`Bot: ${error}`);
      }
      for (const warning of botValidation.warnings) {
        warnings.push(`Bot: ${warning}`);
      }
    }
  }

  validatePositiveInteger(waveSpawn.totalCount, "TotalCount", errors);
  validatePositiveInteger(waveSpawn.maxActive, "MaxActive", errors);
  validatePositiveInteger(waveSpawn.spawnCount, "SpawnCount", errors);
  validateNonNegativeNumber(waveSpawn.totalCurrency, "TotalCurrency", errors);
  validateNonNegativeNumber(waveSpawn.waitBeforeStarting, "WaitBeforeStarting", errors);
  validateNonNegativeNumber(waveSpawn.waitBetweenSpawns, "WaitBetweenSpawns", errors);

  validateWaitReference(waveSpawn.waitForAllSpawned, "WaitForAllSpawned", waveSpawnNames, warnings);
  validateWaitReference(waveSpawn.waitForAllDead, "WaitForAllDead", waveSpawnNames, warnings);

  const totalCount = Number(waveSpawn.totalCount);
  const maxActive = Number(waveSpawn.maxActive);
  const spawnCount = Number(waveSpawn.spawnCount);
  const totalCurrency = Number(waveSpawn.totalCurrency);
  const waitBeforeStarting = Number(waveSpawn.waitBeforeStarting);

  if (isPositiveNumber(totalCount) && isPositiveNumber(maxActive) && maxActive > totalCount) {
    errors.push("MaxActive cannot be greater than TotalCount.");
  }

  if (isPositiveNumber(totalCount) && isPositiveNumber(spawnCount) && spawnCount > totalCount) {
    errors.push("SpawnCount cannot be greater than TotalCount.");
  }

  if (isPositiveNumber(totalCount) && Number.isFinite(totalCurrency) && totalCurrency > 0 && totalCurrency % totalCount !== 0) {
    warnings.push("TotalCurrency does not divide evenly by TotalCount.");
  }

  if (waveSpawn.support && Number.isFinite(totalCurrency) && totalCurrency > 0) {
    warnings.push("Support WaveSpawns usually should not carry currency unless that is intentional.");
  }

  if (waveSpawn.support && Number.isFinite(waitBeforeStarting) && waitBeforeStarting > 180) {
    warnings.push("Support WaveSpawn waits more than 180 seconds before activating.");
  }

  if (waveSpawn.randomSpawn && allowedSpawnNames && allowedSpawnNames.length <= 1) {
    warnings.push("RandomSpawn is enabled, but the selected map data exposes only one spawn name for this editor.");
  }

  return { errors, warnings };
}

function validatePositiveInteger(value, label, errors) {
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
    errors.push(`${label} must be a positive whole number.`);
  }
}

function validateNonNegativeNumber(value, label, errors) {
  if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
    errors.push(`${label} must be zero or greater.`);
  }
}

function validateWaitReference(value, label, waveSpawnNames, warnings) {
  if (value && waveSpawnNames.length > 0 && !waveSpawnNames.includes(value)) {
    warnings.push(`${label} references missing WaveSpawn "${value}".`);
  }
}

function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}
