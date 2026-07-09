import { exportBot, formatPopValue, indent } from "./exportBot.js";

export function exportMission(mission, indentLevel = 0) {
  const blockIndent = indent(indentLevel);
  const fieldIndent = indent(indentLevel + 1);
  const lines = [`${blockIndent}Mission`, `${blockIndent}{`];
  const pushField = (key, value) => {
    if (value !== "" && value !== undefined && value !== null) {
      lines.push(`${fieldIndent}${key} ${formatPopValue(value)}`);
    }
  };

  pushField("Objective", mission.objective);
  pushField("Where", mission.where);
  pushField("TeleportWhere", mission.teleportWhere);
  pushField("BeginAtWave", mission.beginAtWave);
  pushField("RunForThisManyWaves", mission.runForThisManyWaves);
  pushField("InitialCooldown", mission.initialCooldown);
  pushField("CooldownTime", mission.cooldownTime);
  pushField("DesiredCount", mission.desiredCount);

  lines.push(exportBot(mission.bot, indentLevel + 1));
  lines.push(`${blockIndent}}`);
  return lines.join("\n");
}
