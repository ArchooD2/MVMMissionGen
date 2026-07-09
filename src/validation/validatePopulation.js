import { findMap } from "../data/maps.js";
import { validateMission } from "./validateMission.js";
import { validateWave } from "./validateWave.js";

export function validatePopulation(population, wave, missions = []) {
  const errors = [];
  const warnings = [];
  const selectedMap = findMap(population.mapId);
  const spawnNames = selectedMap?.spawnNames ?? [];
  const tankPaths = selectedMap?.tankPaths ?? [];

  if (!population.rootName) {
    errors.push("Population root name is required.");
  } else if (!isPopIdentifier(population.rootName)) {
    errors.push(`Population root name "${population.rootName}" is not a safe .pop block identifier.`);
  }

  if (!population.mapId) {
    errors.push("Map is required.");
  } else if (!selectedMap) {
    errors.push(`Map "${population.mapId}" is not supported by the starter map data.`);
  }

  validateNonNegativeNumber(population.startingCurrency, "StartingCurrency", errors, { required: true });
  validateNonNegativeNumber(population.respawnWaveTime, "RespawnWaveTime", errors);

  if (population.canBotsAttackWhileInSpawnRoom && !["yes", "no"].includes(population.canBotsAttackWhileInSpawnRoom)) {
    errors.push("CanBotsAttackWhileInSpawnRoom must be yes or no.");
  }

  const duplicateBaseFiles = findDuplicates(population.baseFiles.filter(Boolean));
  if (duplicateBaseFiles.length > 0) {
    warnings.push(`#base file listed more than once: ${duplicateBaseFiles.join(", ")}.`);
  }

  if (!population.baseFiles.includes("robot_giant.pop")) {
    warnings.push("Most sample missions include #base robot_giant.pop.");
  }

  if (!population.baseFiles.includes("robot_standard.pop")) {
    warnings.push("Most sample missions include #base robot_standard.pop.");
  }

  if (Number(population.startingCurrency) > 5000) {
    warnings.push("StartingCurrency is unusually high compared with the current samples.");
  }

  if (!wave) {
    errors.push("At least one Wave is required.");
  } else {
    const waveValidation = validateWave(wave, { spawnNames, tankPaths, selectedMap });
    for (const error of waveValidation.errors) {
      errors.push(`Wave: ${error}`);
    }
    for (const warning of waveValidation.warnings) {
      warnings.push(`Wave: ${warning}`);
    }
  }

  missions.forEach((mission, index) => {
    const missionValidation = validateMission(mission, { spawnNames });
    for (const error of missionValidation.errors) {
      errors.push(`Mission ${index + 1}: ${error}`);
    }
    for (const warning of missionValidation.warnings) {
      warnings.push(`Mission ${index + 1}: ${warning}`);
    }
  });

  if (missions.length === 0) {
    warnings.push("No support Missions are configured yet.");
  }

  if (selectedMap && spawnNames.length === 0) {
    warnings.push(`${selectedMap.displayName} has no starter spawn names yet.`);
  }

  return { errors, warnings };
}

function validateNonNegativeNumber(value, label, errors, options = {}) {
  if (options.required && value === "") {
    errors.push(`${label} is required.`);
    return;
  }

  if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
    errors.push(`${label} must be zero or greater.`);
  }
}

function isPopIdentifier(value) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates];
}
