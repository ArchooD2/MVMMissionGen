import { missionObjectives } from "../data/missionPresets.js";

export function validateMission(mission, options = {}) {
  const errors = [];
  const warnings = [];
  const spawnNames = options.spawnNames ?? [];

  if (!mission.objective) {
    errors.push("Objective is required.");
  } else if (!missionObjectives.includes(mission.objective)) {
    errors.push(`Objective "${mission.objective}" is not supported by this milestone.`);
  }

  if (!mission.where) {
    errors.push("Where is required.");
  } else if (spawnNames.length > 0 && !spawnNames.includes(mission.where)) {
    warnings.push(`Where "${mission.where}" is not listed for the selected map.`);
  }

  if (mission.teleportWhere && spawnNames.length > 0 && !spawnNames.includes(mission.teleportWhere)) {
    warnings.push(`TeleportWhere "${mission.teleportWhere}" is not listed for the selected map.`);
  }

  validatePositiveInteger(mission.beginAtWave, "BeginAtWave", errors);
  validatePositiveInteger(mission.runForThisManyWaves, "RunForThisManyWaves", errors);
  validateNonNegativeNumber(mission.initialCooldown, "InitialCooldown", errors);
  validateNonNegativeNumber(mission.cooldownTime, "CooldownTime", errors);
  validatePositiveInteger(mission.desiredCount, "DesiredCount", errors);

  if (!mission.bot?.template && !mission.bot?.class) {
    errors.push("Mission bot needs a template or class.");
  }

  if (mission.objective === "Engineer" && !mission.teleportWhere) {
    warnings.push("Engineer missions often use TeleportWhere so spawned bots can use the teleporter.");
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
