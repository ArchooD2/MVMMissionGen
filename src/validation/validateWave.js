import { calculateWaveCurrency } from "../state/createWave.js";
import { validateWaveSpawn } from "./validateWaveSpawn.js";

export function validateWave(wave, options = {}) {
  const errors = [];
  const warnings = [];

  if (!wave.waveSpawns || wave.waveSpawns.length === 0) {
    errors.push("Wave must contain at least one WaveSpawn.");
  }

  if (wave.waitWhenDone !== "" && (!Number.isFinite(Number(wave.waitWhenDone)) || Number(wave.waitWhenDone) < 0)) {
    errors.push("WaitWhenDone must be zero or greater.");
  }

  if (wave.checkpoint && !["Yes", "No"].includes(wave.checkpoint)) {
    errors.push("Checkpoint must be Yes, No, or omitted.");
  }

  if (Number(wave.waitWhenDone) > 120) {
    warnings.push("WaitWhenDone is unusually long.");
  }

  if (calculateWaveCurrency(wave) === 0) {
    warnings.push("Wave has no currency assigned across its WaveSpawns.");
  }

  const names = (wave.waveSpawns ?? [])
    .map((entry) => entry.waveSpawn.name)
    .filter(Boolean);
  const duplicateNames = findDuplicates(names);
  if (duplicateNames.length > 0) {
    warnings.push(`Duplicate WaveSpawn name(s): ${duplicateNames.join(", ")}.`);
  }

  for (const entry of wave.waveSpawns ?? []) {
    const validation = validateWaveSpawn(entry.waveSpawn, entry.bot, { ...options, waveSpawnNames: names });
    for (const error of validation.errors) {
      errors.push(`${entry.label}: ${error}`);
    }
    for (const warning of validation.warnings) {
      warnings.push(`${entry.label}: ${warning}`);
    }
  }

  return { errors, warnings };
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

