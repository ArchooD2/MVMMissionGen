export function validateTank(tank, options = {}) {
  const errors = [];
  const warnings = [];
  const tankPaths = options.tankPaths ?? [];

  if (!tank.health || !Number.isFinite(Number(tank.health)) || Number(tank.health) <= 0) {
    errors.push("Tank health must be a positive number.");
  }

  if (!tank.speed || !Number.isFinite(Number(tank.speed)) || Number(tank.speed) <= 0) {
    errors.push("Tank speed must be a positive number.");
  }

  if (tank.skin !== "" && (!Number.isInteger(Number(tank.skin)) || Number(tank.skin) < 0)) {
    errors.push("Tank skin must be zero or a positive whole number.");
  }

  if (!tank.name) {
    warnings.push("Tank name is empty.");
  }

  if (!tank.startingPathTrackNode) {
    if (tankPaths.length > 0) {
      errors.push("Tank StartingPathTrackNode is required for the selected map.");
    } else {
      warnings.push("Tank has no StartingPathTrackNode.");
    }
  } else if (tankPaths.length > 0 && !tankPaths.includes(tank.startingPathTrackNode)) {
    errors.push(`Tank path "${tank.startingPathTrackNode}" is not listed for the selected map.`);
  }

  return { errors, warnings };
}
