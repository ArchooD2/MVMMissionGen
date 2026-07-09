export const missionObjectives = ["DestroySentries", "Sniper", "Spy", "Engineer"];

export const missionPresets = [
  {
    id: "sentry_buster",
    label: "Sentry Buster",
    objective: "DestroySentries",
    template: "T_TFBot_SentryBuster",
    preferredSpawnIncludes: ["sentry_buster", "spawnbot"],
    initialCooldown: "5",
    cooldownTime: "35",
    desiredCount: "1",
    beginAtWave: "1",
    runForThisManyWaves: "1",
  },
  {
    id: "sniper",
    label: "Sniper",
    objective: "Sniper",
    template: "T_TFBot_Sniper",
    preferredSpawnIncludes: ["sniper"],
    initialCooldown: "30",
    cooldownTime: "45",
    desiredCount: "2",
    beginAtWave: "1",
    runForThisManyWaves: "1",
  },
  {
    id: "spy",
    label: "Spy",
    objective: "Spy",
    template: "T_TFBot_Spy",
    preferredSpawnIncludes: ["spy"],
    initialCooldown: "30",
    cooldownTime: "30",
    desiredCount: "2",
    beginAtWave: "1",
    runForThisManyWaves: "1",
  },
  {
    id: "engineer",
    label: "Engineer",
    objective: "Engineer",
    template: "T_TFBot_Engineer_Sentry_Teleporter",
    preferredSpawnIncludes: ["engy", "engineer", "spawnbot"],
    initialCooldown: "60",
    cooldownTime: "60",
    desiredCount: "1",
    beginAtWave: "1",
    runForThisManyWaves: "1",
    teleportWhere: "spawnbot",
  },
];

export function findMissionPreset(presetId) {
  return missionPresets.find((preset) => preset.id === presetId);
}
