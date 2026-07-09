export const classIcons = [
  { id: "scout", label: "Scout" },
  { id: "scout_bonk", label: "Bonk Scout" },
  { id: "scout_fan", label: "Force-A-Nature Scout" },
  { id: "scout_stun", label: "Sandman Scout" },
  { id: "soldier", label: "Soldier" },
  { id: "soldier_crit", label: "Charged Soldier" },
  { id: "soldier_spammer", label: "Rapid Fire Soldier" },
  { id: "soldier_buff", label: "Buff Soldier" },
  { id: "soldier_conch", label: "Concheror Soldier" },
  { id: "soldier_backup", label: "Battalion Soldier" },
  { id: "pyro", label: "Pyro" },
  { id: "pyro_flare", label: "Flare Pyro" },
  { id: "demoman", label: "Demoman" },
  { id: "demoknight", label: "Demoknight" },
  { id: "demo_burst", label: "Burst Fire Demo" },
  { id: "heavyweapons", label: "HeavyWeapons" },
  { id: "heavy_deflector", label: "Deflector Heavy" },
  { id: "heavy_steelfist", label: "Steel Gauntlet" },
  { id: "heavy_shotgun", label: "Shotgun Heavy" },
  { id: "medic", label: "Medic" },
  { id: "medic_uber", label: "Uber Medic" },
  { id: "sniper", label: "Sniper" },
  { id: "sniper_bow", label: "Bowman" },
  { id: "sniper_sydneysleeper", label: "Sydney Sniper" },
  { id: "spy", label: "Spy" },
  { id: "engineer", label: "Engineer" },
  { id: "sentry_buster", label: "Sentry Buster" },
];

export function hasClassIcon(iconId) {
  return classIcons.some((icon) => icon.id === iconId);
}
