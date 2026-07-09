export function exportBot(bot, indentLevel = 0) {
  const blockIndent = indent(indentLevel);
  const fieldIndent = indent(indentLevel + 1);
  const lines = [`${blockIndent}TFBot`, `${blockIndent}{`];
  const pushField = (key, value) => {
    if (value !== "" && value !== undefined && value !== null) {
      lines.push(`${fieldIndent}${key} ${formatPopValue(value)}`);
    }
  };

  pushField("Template", bot.template);
  pushField("Name", bot.name);
  pushField("Class", bot.class);
  pushField("Skill", bot.skill);
  pushField("ClassIcon", bot.classIcon);
  pushField("Health", bot.health);
  pushField("Scale", bot.scale);

  for (const attribute of bot.attributes) {
    pushField("Attributes", attribute);
  }

  pushField("WeaponRestrictions", bot.weaponRestrictions);
  pushField("BehaviorModifiers", bot.behaviorModifiers);

  for (const tag of bot.tags) {
    pushField("Tag", tag);
  }

  lines.push(`${blockIndent}}`);
  return lines.join("\n");
}

export function formatPopValue(value) {
  const text = String(value);

  if (text === "") {
    return "\"\"";
  }

  if (/^[A-Za-z0-9_.$+-]+$/.test(text)) {
    return text;
  }

  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
}

export function indent(level) {
  return "    ".repeat(level);
}
