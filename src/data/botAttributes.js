export const botAttributes = [
  { id: "SpawnWithFullCharge", label: "Spawn With Full Charge" },
  { id: "AlwaysCrit", label: "Always Crit" },
  { id: "HoldFireUntilFullReload", label: "Hold Fire Until Full Reload" },
  { id: "RemoveOnDeath", label: "Remove On Death" },
  { id: "SuppressFire", label: "Suppress Fire" },
  { id: "DisableDodge", label: "Disable Dodge" },
  { id: "BecomeSpectatorOnDeath", label: "Become Spectator On Death" },
  { id: "RetainBuildings", label: "Retain Buildings" },
  { id: "MiniBoss", label: "MiniBoss" },
  { id: "UseBossHealthBar", label: "Use Boss Health Bar" },
  { id: "TeleportToHint", label: "Teleport To Hint" },
  { id: "AlwaysFireWeapon", label: "Always Fire Weapon" },
  { id: "IgnoreFlag", label: "Ignore Flag" },
  { id: "AutoJump", label: "Auto Jump" },
  { id: "AirChargeOnly", label: "Air Charge Only" },
  { id: "VaccinatorBullets", label: "Vaccinator Bullets" },
  { id: "VaccinatorBlast", label: "Vaccinator Blast" },
  { id: "VaccinatorFire", label: "Vaccinator Fire" },
];

export function hasBotAttribute(attributeId) {
  return botAttributes.some((attribute) => attribute.id === attributeId);
}
