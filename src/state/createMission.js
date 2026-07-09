import { findMissionPreset, missionPresets } from "../data/missionPresets.js";

export function createMission(overrides = {}) {
  const preset = findMissionPreset(overrides.presetId ?? missionPresets[0]?.id);

  return {
    id: overrides.id ?? Date.now(),
    presetId: overrides.presetId ?? preset?.id ?? "",
    label: overrides.label ?? preset?.label ?? "Mission",
    objective: overrides.objective ?? preset?.objective ?? "DestroySentries",
    where: overrides.where ?? preset?.where ?? "spawnbot",
    teleportWhere: overrides.teleportWhere ?? preset?.teleportWhere ?? "",
    beginAtWave: normalizeTextValue(overrides.beginAtWave ?? preset?.beginAtWave ?? "1"),
    runForThisManyWaves: normalizeTextValue(overrides.runForThisManyWaves ?? preset?.runForThisManyWaves ?? "1"),
    initialCooldown: normalizeTextValue(overrides.initialCooldown ?? preset?.initialCooldown ?? "30"),
    cooldownTime: normalizeTextValue(overrides.cooldownTime ?? preset?.cooldownTime ?? "30"),
    desiredCount: normalizeTextValue(overrides.desiredCount ?? preset?.desiredCount ?? "1"),
    bot: overrides.bot ? createMissionBotFromObject(overrides.bot) : createMissionBot(preset?.template ?? ""),
  };
}

export function createMissionFromPreset(presetId, spawnNames = []) {
  const preset = findMissionPreset(presetId);
  const where = pickSpawnName(preset, spawnNames);

  return createMission({
    presetId,
    id: Date.now(),
    label: preset?.label,
    objective: preset?.objective,
    where,
    teleportWhere: preset?.teleportWhere ?? "",
    beginAtWave: preset?.beginAtWave,
    runForThisManyWaves: preset?.runForThisManyWaves,
    initialCooldown: preset?.initialCooldown,
    cooldownTime: preset?.cooldownTime,
    desiredCount: preset?.desiredCount,
    bot: createMissionBot(preset?.template ?? ""),
  });
}

export function updateMission(mission, patch) {
  return {
    ...mission,
    ...patch,
    bot: patch.bot ?? mission.bot,
  };
}

export function addMission(missions, mission) {
  return [...missions, mission];
}

export function removeMission(missions, missionId) {
  return missions.filter((mission) => mission.id !== missionId);
}

function createMissionBot(template) {
  return createMissionBotFromObject({ template });
}

function createMissionBotFromObject(overrides = {}) {
  return {
    templateId: overrides.templateId ?? "",
    template: overrides.template ?? "",
    name: overrides.name ?? "",
    class: overrides.class ?? "",
    skill: overrides.skill ?? "",
    health: normalizeTextValue(overrides.health ?? ""),
    classIcon: overrides.classIcon ?? "",
    scale: normalizeTextValue(overrides.scale ?? ""),
    attributes: [...(overrides.attributes ?? [])],
    weaponRestrictions: overrides.weaponRestrictions ?? "",
    behaviorModifiers: overrides.behaviorModifiers ?? "",
    tags: [...(overrides.tags ?? [])],
  };
}

function pickSpawnName(preset, spawnNames) {
  if (!preset || spawnNames.length === 0) {
    return preset?.where ?? "spawnbot";
  }

  for (const token of preset.preferredSpawnIncludes) {
    const match = spawnNames.find((spawnName) => spawnName.toLowerCase().includes(token.toLowerCase()));
    if (match) {
      return match;
    }
  }

  return spawnNames[0];
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}


