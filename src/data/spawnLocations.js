export const starterSpawnLocations = [
  { id: "spawnbot", label: "spawnbot" },
  { id: "spawnbot_left", label: "spawnbot_left" },
  { id: "spawnbot_right", label: "spawnbot_right" },
  { id: "spawnbot_mission_sniper", label: "spawnbot_mission_sniper" },
  { id: "spawnbot_mission_spy", label: "spawnbot_mission_spy" },
  { id: "spawnbot_mission_sentrybuster", label: "spawnbot_mission_sentrybuster" },
  { id: "spawnbot_mission_engy", label: "spawnbot_mission_engy" },
  { id: "AHEAD", label: "AHEAD" },
  { id: "BEHIND", label: "BEHIND" },
  { id: "ANYWHERE", label: "ANYWHERE" },
];

export function hasStarterSpawnLocation(spawnLocation) {
  return starterSpawnLocations.some((location) => location.id === spawnLocation);
}
