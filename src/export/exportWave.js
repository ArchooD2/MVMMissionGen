import { formatPopValue, indent } from "./exportBot.js";
import { exportWaveSpawn } from "./exportWaveSpawn.js";

export function exportWave(wave, indentLevel = 0, selectedMap = null) {
  const blockIndent = indent(indentLevel);
  const fieldIndent = indent(indentLevel + 1);
  const lines = [`${blockIndent}Wave`, `${blockIndent}{`];
  const pushField = (key, value) => {
    if (value !== "" && value !== undefined && value !== null) {
      lines.push(`${fieldIndent}${key} ${formatPopValue(value)}`);
    }
  };

  pushField("Description", wave.description);
  pushField("Sound", wave.sound);
  pushField("WaitWhenDone", wave.waitWhenDone);
  pushField("Checkpoint", wave.checkpoint);

  pushOutputBlock(lines, "StartWaveOutput", selectedMap?.startWaveOutput, indentLevel + 1);
  pushOutputBlock(lines, "DoneOutput", selectedMap?.doneOutput, indentLevel + 1);

  for (const entry of wave.waveSpawns) {
    lines.push(exportWaveSpawn(entry.waveSpawn, entry.bot, indentLevel + 1));
  }

  lines.push(`${blockIndent}}`);
  return lines.join("\n");
}

function pushOutputBlock(lines, name, target, indentLevel) {
  if (!target) {
    return;
  }

  const blockIndent = indent(indentLevel);
  const fieldIndent = indent(indentLevel + 1);
  lines.push(`${blockIndent}${name}`);
  lines.push(`${blockIndent}{`);
  lines.push(`${fieldIndent}Target ${formatPopValue(target)}`);
  lines.push(`${fieldIndent}Action Trigger`);
  lines.push(`${blockIndent}}`);
}

