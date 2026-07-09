export const tfClasses = [
  { id: "Scout", label: "Scout", defaultHealth: 125, defaultIcon: "scout" },
  { id: "Soldier", label: "Soldier", defaultHealth: 200, defaultIcon: "soldier" },
  { id: "Pyro", label: "Pyro", defaultHealth: 175, defaultIcon: "pyro" },
  { id: "Demoman", label: "Demoman", defaultHealth: 175, defaultIcon: "demoman" },
  { id: "HeavyWeapons", label: "HeavyWeapons", defaultHealth: 300, defaultIcon: "heavyweapons" },
  { id: "Medic", label: "Medic", defaultHealth: 150, defaultIcon: "medic" },
  { id: "Sniper", label: "Sniper", defaultHealth: 125, defaultIcon: "sniper" },
  { id: "Spy", label: "Spy", defaultHealth: 125, defaultIcon: "spy" },
  { id: "Engineer", label: "Engineer", defaultHealth: 125, defaultIcon: "engineer" },
  { id: "SentryBuster", label: "Sentry Buster", defaultHealth: 2500, defaultIcon: "sentry_buster" },
];

export const skills = ["Easy", "Normal", "Hard", "Expert"];

export const weaponRestrictions = ["", "PrimaryOnly", "SecondaryOnly", "MeleeOnly"];

export const behaviorModifiers = ["", "Idler", "Mobber"];

export function findClass(classId) {
  return tfClasses.find((tfClass) => tfClass.id === classId);
}
