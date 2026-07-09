export function createTank(overrides = {}) {
  return {
    name: overrides.name ?? "tankboss",
    health: normalizeTextValue(overrides.health ?? "20000"),
    speed: normalizeTextValue(overrides.speed ?? "75"),
    skin: normalizeTextValue(overrides.skin ?? "0"),
    startingPathTrackNode: overrides.startingPathTrackNode ?? "boss_path_1",
  };
}

export function updateTank(tank, patch) {
  return createTank({
    ...tank,
    ...patch,
  });
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
