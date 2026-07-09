export function createWave(overrides = {}) {
  return {
    description: overrides.description ?? "",
    sound: overrides.sound ?? "",
    waitWhenDone: normalizeTextValue(overrides.waitWhenDone ?? "25"),
    checkpoint: overrides.checkpoint ?? "Yes",
    waveSpawns: [...(overrides.waveSpawns ?? [])],
    nextWaveSpawnId: overrides.nextWaveSpawnId ?? 1,
  };
}

export function updateWave(wave, patch) {
  return createWave({
    ...wave,
    ...patch,
  });
}

export function addWaveSpawnToWave(wave, waveSpawn, bot) {
  const entry = {
    id: wave.nextWaveSpawnId,
    label: waveSpawn.name || `WaveSpawn ${wave.nextWaveSpawnId}`,
    waveSpawn: clonePlainObject(waveSpawn),
    bot: clonePlainObject(bot),
  };

  return updateWave(wave, {
    waveSpawns: [...wave.waveSpawns, entry],
    nextWaveSpawnId: wave.nextWaveSpawnId + 1,
  });
}

export function removeWaveSpawnFromWave(wave, entryId) {
  return updateWave(wave, {
    waveSpawns: wave.waveSpawns.filter((entry) => entry.id !== entryId),
  });
}

export function calculateWaveCurrency(wave) {
  return wave.waveSpawns.reduce((total, entry) => {
    const currency = Number(entry.waveSpawn.totalCurrency);
    return Number.isFinite(currency) ? total + currency : total;
  }, 0);
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function clonePlainObject(value) {
  return JSON.parse(JSON.stringify(value));
}
