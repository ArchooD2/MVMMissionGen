export const botTemplates = [
  {
    id: "basic_scout",
    sourceTemplate: "T_TFBot_Scout_Melee",
    label: "Scout",
    bot: { name: "Scout", class: "Scout", skill: "Normal", health: 125, classIcon: "scout", attributes: [] },
  },
  {
    id: "minor_league_scout",
    sourceTemplate: "T_TFBot_Scout_Sandman",
    label: "Minor League Scout",
    bot: { name: "Minor League Scout", class: "Scout", skill: "Hard", health: 125, classIcon: "scout_stun", attributes: [] },
  },
  {
    id: "giant_scout",
    sourceTemplate: "T_TFBot_Giant_Scout",
    label: "Giant Scout",
    bot: { name: "Giant Scout", class: "Scout", skill: "Expert", health: 1200, classIcon: "scout", attributes: ["MiniBoss"] },
  },
  {
    id: "soldier",
    sourceTemplate: "T_TFBot_Soldier",
    label: "Soldier",
    bot: { name: "Soldier", class: "Soldier", skill: "Normal", health: 200, classIcon: "soldier", attributes: [] },
  },
  {
    id: "buff_soldier",
    sourceTemplate: "T_TFBot_Soldier_Buff_Banner",
    label: "Buff Soldier",
    bot: { name: "Buff Soldier", class: "Soldier", skill: "Hard", health: 200, classIcon: "soldier_buff", attributes: [] },
  },
  {
    id: "giant_soldier",
    sourceTemplate: "T_TFBot_Giant_Soldier",
    label: "Giant Soldier",
    bot: { name: "Giant Soldier", class: "Soldier", skill: "Expert", health: 3800, classIcon: "soldier", attributes: ["MiniBoss"] },
  },
  {
    id: "giant_charged_soldier",
    sourceTemplate: "T_TFBot_Giant_Soldier_Crit",
    label: "Giant Charged Soldier",
    bot: { name: "Giant Charged Soldier", class: "Soldier", skill: "Expert", health: 3800, classIcon: "soldier_crit", attributes: ["MiniBoss", "AlwaysCrit"] },
  },
  {
    id: "pyro",
    sourceTemplate: "T_TFBot_Pyro",
    label: "Pyro",
    bot: { name: "Pyro", class: "Pyro", skill: "Normal", health: 175, classIcon: "pyro", attributes: [] },
  },
  {
    id: "flare_pyro",
    sourceTemplate: "T_TFBot_Pyro_Flaregun",
    label: "Flare Pyro",
    bot: { name: "Flare Pyro", class: "Pyro", skill: "Hard", health: 175, classIcon: "pyro_flare", attributes: [] },
  },
  {
    id: "demoman",
    sourceTemplate: "T_TFBot_Demoman",
    label: "Demoman",
    bot: { name: "Demoman", class: "Demoman", skill: "Normal", health: 175, classIcon: "demoman", attributes: [] },
  },
  {
    id: "demoknight",
    sourceTemplate: "T_TFBot_Demoman_Knight",
    label: "Demoknight",
    bot: { name: "Demoknight", class: "Demoman", skill: "Hard", health: 175, classIcon: "demoknight", attributes: [] },
  },
  {
    id: "giant_demo",
    sourceTemplate: "T_TFBot_Giant_Demoman",
    label: "Giant Rapid Fire Demoman",
    bot: { name: "Giant Rapid Fire Demoman", class: "Demoman", skill: "Expert", health: 3300, classIcon: "demoman", attributes: ["MiniBoss", "HoldFireUntilFullReload"] },
  },
  {
    id: "heavy",
    sourceTemplate: "T_TFBot_Heavyweapons",
    label: "Heavy",
    bot: { name: "Heavy", class: "HeavyWeapons", skill: "Normal", health: 300, classIcon: "heavyweapons", attributes: [] },
  },
  {
    id: "steel_gauntlet",
    sourceTemplate: "T_TFBot_Heavyweapons_Fist",
    label: "Steel Gauntlet",
    bot: { name: "Steel Gauntlet", class: "HeavyWeapons", skill: "Hard", health: 900, classIcon: "heavy_steelfist", attributes: [] },
  },
  {
    id: "giant_heavy",
    sourceTemplate: "T_TFBot_Giant_Heavyweapons",
    label: "Giant Heavy",
    bot: { name: "Giant Heavy", class: "HeavyWeapons", skill: "Expert", health: 5000, classIcon: "heavyweapons", attributes: ["MiniBoss"] },
  },
  {
    id: "uber_medic",
    sourceTemplate: "T_TFBot_Medic",
    label: "Uber Medic",
    bot: { name: "Uber Medic", class: "Medic", skill: "Normal", health: 150, classIcon: "medic_uber", attributes: ["SpawnWithFullCharge"] },
  },
  {
    id: "sniper",
    sourceTemplate: "T_TFBot_Sniper",
    label: "Sniper",
    bot: { name: "Sniper", class: "Sniper", skill: "Hard", health: 125, classIcon: "sniper", attributes: [] },
  },
  {
    id: "spy",
    sourceTemplate: "T_TFBot_Spy",
    label: "Spy",
    bot: { name: "Spy", class: "Spy", skill: "Expert", health: 125, classIcon: "spy", attributes: [] },
  },
  {
    id: "engineer",
    sourceTemplate: "T_TFBot_Engineer_Sentry_Teleporter",
    label: "Engineer",
    bot: { name: "Engineer", class: "Engineer", skill: "Hard", health: 125, classIcon: "engineer", attributes: ["TeleportToHint"] },
  },
  {
    id: "sentry_buster",
    sourceTemplate: "T_TFBot_SentryBuster",
    label: "Sentry Buster",
    bot: { name: "Sentry Buster", class: "SentryBuster", skill: "Expert", health: 2500, classIcon: "sentry_buster", attributes: ["MiniBoss", "AlwaysCrit"] },
  },
];

export function findBotTemplate(templateId) {
  return botTemplates.find((template) => template.id === templateId);
}
