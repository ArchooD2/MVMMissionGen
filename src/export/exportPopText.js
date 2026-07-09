export function exportPopText({ population, missions, waves }) {
  const lines = [];

  for (const baseFile of population.baseFiles ?? []) {
    lines.push(`#base "${baseFile}"`);
  }

  lines.push("");
  lines.push(`${population.rootName || "WaveSchedule"}`);
  lines.push("{");

  field(lines, 1, "StartingCurrency", population.startingCurrency);
  field(lines, 1, "RespawnWaveTime", population.respawnWaveTime);
  field(lines, 1, "CanBotsAttackWhileInSpawnRoom", population.canBotsAttackWhileInSpawnRoom);

  if (population.advanced) {
    field(lines, 1, "Advanced", "1");
  }

  if (population.fixedRespawnWaveTime) {
    field(lines, 1, "FixedRespawnWaveTime", "Yes");
  }

  if (population.eventPopfile) {
    field(lines, 1, "EventPopfile", population.eventPopfile);
  }

  for (const mission of missions) {
    lines.push("");
    block(lines, 1, "Mission", () => {
      field(lines, 2, "Objective", mission.objective);
      field(lines, 2, "Where", mission.where);

      if (mission.teleportWhere) {
        field(lines, 2, "TeleportWhere", mission.teleportWhere);
      }

      field(lines, 2, "BeginAtWave", mission.beginAtWave);
      field(lines, 2, "RunForThisManyWaves", mission.runForThisManyWaves);
      field(lines, 2, "InitialCooldown", mission.initialCooldown);
      field(lines, 2, "CooldownTime", mission.cooldownTime);
      field(lines, 2, "DesiredCount", mission.desiredCount);

      renderBot(lines, 2, mission.bot);
    });
  }

  for (const wave of waves) {
    lines.push("");
    block(lines, 1, "Wave", () => {
      if (wave.description) {
        field(lines, 2, "Description", quote(wave.description));
      }

      if (wave.sound) {
        field(lines, 2, "Sound", quote(wave.sound));
      }

      field(lines, 2, "WaitWhenDone", wave.waitWhenDone);
      field(lines, 2, "Checkpoint", wave.checkpoint);

      for (const entry of wave.waveSpawns) {
        lines.push("");
        renderWaveSpawn(lines, 2, entry.waveSpawn, entry.bot);
      }
    });
  }

  lines.push("}");
  return `${lines.join("\n")}\n`;
}

function renderWaveSpawn(lines, indent, waveSpawn, bot) {
  block(lines, indent, "WaveSpawn", () => {
    field(lines, indent + 1, "Name", quote(waveSpawn.name));
    field(lines, indent + 1, "Where", waveSpawn.where);
    field(lines, indent + 1, "TotalCount", waveSpawn.totalCount);
    field(lines, indent + 1, "MaxActive", waveSpawn.maxActive);
    field(lines, indent + 1, "SpawnCount", waveSpawn.spawnCount);
    field(lines, indent + 1, "TotalCurrency", waveSpawn.totalCurrency);
    field(lines, indent + 1, "WaitBeforeStarting", waveSpawn.waitBeforeStarting);
    field(lines, indent + 1, "WaitBetweenSpawns", waveSpawn.waitBetweenSpawns);

    if (waveSpawn.support) {
      field(lines, indent + 1, "Support", "1");
    }

    if (waveSpawn.randomSpawn) {
      field(lines, indent + 1, "RandomSpawn", "1");
    }

    if (waveSpawn.spawnerType === "Tank") {
      renderTank(lines, indent + 1, waveSpawn.tank);
    } else {
      renderBot(lines, indent + 1, bot);
    }
  });
}

function renderBot(lines, indent, bot) {
  block(lines, indent, "TFBot", () => {
    if (bot.template) {
      field(lines, indent + 1, "Template", bot.template);
    }

    field(lines, indent + 1, "Name", quote(bot.name));
    field(lines, indent + 1, "Class", bot.class);
    field(lines, indent + 1, "Skill", bot.skill);

    if (bot.health) {
      field(lines, indent + 1, "Health", bot.health);
    }

    if (bot.classIcon) {
      field(lines, indent + 1, "ClassIcon", bot.classIcon);
    }

    if (bot.scale) {
      field(lines, indent + 1, "Scale", bot.scale);
    }

    for (const attribute of bot.attributes ?? []) {
      field(lines, indent + 1, "Attributes", quote(attribute));
    }

    if (bot.weaponRestrictions) {
      field(lines, indent + 1, "WeaponRestrictions", bot.weaponRestrictions);
    }

    if (bot.behaviorModifiers) {
      field(lines, indent + 1, "BehaviorModifiers", bot.behaviorModifiers);
    }

    for (const tag of bot.tags ?? []) {
      field(lines, indent + 1, "Tag", tag);
    }
  });
}

function renderTank(lines, indent, tank) {
  block(lines, indent, "Tank", () => {
    field(lines, indent + 1, "Name", tank.name);
    field(lines, indent + 1, "Health", tank.health);
    field(lines, indent + 1, "Speed", tank.speed);
    field(lines, indent + 1, "Skin", tank.skin);
    field(lines, indent + 1, "StartingPathTrackNode", tank.startingPathTrackNode);
  });
}

function block(lines, indent, name, renderBody) {
  lines.push(`${tabs(indent)}${name}`);
  lines.push(`${tabs(indent)}{`);
  renderBody();
  lines.push(`${tabs(indent)}}`);
}

function field(lines, indent, key, value) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  lines.push(`${tabs(indent)}${key} ${value}`);
}

function quote(value) {
  const text = String(value ?? "");

  if (!text || /^[A-Za-z0-9_./-]+$/.test(text)) {
    return text;
  }

  return `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function tabs(count) {
  return "\t".repeat(count);
}