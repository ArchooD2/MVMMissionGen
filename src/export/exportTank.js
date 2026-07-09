import { formatPopValue, indent } from "./exportBot.js";

export function exportTank(tank, indentLevel = 0) {
  const blockIndent = indent(indentLevel);
  const fieldIndent = indent(indentLevel + 1);
  const lines = [`${blockIndent}Tank`, `${blockIndent}{`];
  const pushField = (key, value) => {
    if (value !== "" && value !== undefined && value !== null) {
      lines.push(`${fieldIndent}${key} ${formatPopValue(value)}`);
    }
  };

  pushField("Name", tank.name);
  pushField("Health", tank.health);
  pushField("Speed", tank.speed);
  pushField("Skin", tank.skin);
  pushField("StartingPathTrackNode", tank.startingPathTrackNode);

  lines.push(`${blockIndent}}`);
  return lines.join("\n");
}
