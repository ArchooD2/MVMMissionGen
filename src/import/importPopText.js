import { maps } from "../data/maps.js";
import { createBot } from "../state/createBot.js";
import { createMission } from "../state/createMission.js";
import { createPopulation } from "../state/createPopulation.js";
import { createTank } from "../state/createTank.js";
import { createWave } from "../state/createWave.js";
import { createWaveSpawn } from "../state/createWaveSpawn.js";
import { parsePopText, summarizePopTree } from "./parsePopText.js";

export function importPopText(source, options = {}) {
  const warnings = [];
  const tree = parsePopText(source);
  const summary = summarizePopTree(tree);
  const root = findPopulationRoot(tree);

  if (!root) {
    return {
      population: createPopulation(),
      missions: [],
      waves: [createWave()],
      wave: createWave(),
      bot: createBot(),
      waveSpawn: createWaveSpawn(),
      summary,
      warnings: ["No population root block was found."],
    };
  }

  const importedMapId = options.mapId || inferMapId(root) || maps[0]?.id || "";
  const population = importPopulation(root, tree, importedMapId);
  const missions = root.children
    .filter((child) => child.type === "block" && child.name === "Mission")
    .map((missionNode, index) => importMission(missionNode, index, warnings));

  const waveNodes = root.children.filter((child) => child.type === "block" && child.name === "Wave");
  const waves = waveNodes.length > 0
    ? waveNodes.map((waveNode) => importWave(waveNode, warnings))
    : [createWave()];

  const wave = waves[0];
  const firstEntry = wave.waveSpawns[0];
  const bot = firstEntry?.bot ?? createBot();
  const waveSpawn = firstEntry?.waveSpawn ?? createWaveSpawn();

  return {
    population,
    missions,
    waves,
    wave,
    bot,
    waveSpawn,
    summary: {
      ...summary,
      importedMapId,
      importedMissionCount: missions.length,
      importedWaveCount: waves.length,
      importedWaveSpawnCount: waves.reduce((total, importedWave) => total + importedWave.waveSpawns.length, 0),
    },
    warnings,
  };
}

function importPopulation(root, tree, mapId) {
  const baseFiles = tree.children
    .filter((child) => child.type === "directive" && child.name === "#base")
    .map((child) => child.value)
    .filter(Boolean);

  return createPopulation({
    rootName: root.name || "WaveSchedule",
    mapId,
    startingCurrency: getFieldValue(root, "StartingCurrency") ?? "400",
    respawnWaveTime: getFieldValue(root, "RespawnWaveTime") ?? "5",
    canBotsAttackWhileInSpawnRoom: normalizeYesNo(getFieldValue(root, "CanBotsAttackWhileInSpawnRoom") ?? "no"),
    advanced: getFieldValue(root, "Advanced") === "1",
    fixedRespawnWaveTime: normalizeYesNo(getFieldValue(root, "FixedRespawnWaveTime") ?? "") === "yes",
    eventPopfile: getFieldValue(root, "EventPopfile") ?? "",
    baseFiles: baseFiles.length > 0 ? baseFiles : ["robot_giant.pop", "robot_standard.pop"],
  });
}

function importMission(node, index, warnings) {
  const botNode = findChildBlock(node, "TFBot");
  const objective = getFieldValue(node, "Objective") ?? "DestroySentries";

  if (!botNode) {
    warnings.push(`Mission ${index + 1} has no supported TFBot block.`);
  }

  return createMission({
    id: Date.now() + index,
    presetId: "",
    label: `Imported ${objective}`,
    objective,
    where: getFieldValue(node, "Where") ?? "spawnbot",
    teleportWhere: getFieldValue(node, "TeleportWhere") ?? "",
    beginAtWave: getFieldValue(node, "BeginAtWave") ?? "1",
    runForThisManyWaves: getFieldValue(node, "RunForThisManyWaves") ?? "1",
    initialCooldown: getFieldValue(node, "InitialCooldown") ?? "0",
    cooldownTime: getFieldValue(node, "CooldownTime") ?? "30",
    desiredCount: getFieldValue(node, "DesiredCount") ?? "1",
    bot: importBot(botNode ?? { children: [] }),
  });
}

function importWave(node, warnings) {
  const waveSpawns = node.children
    .filter((child) => child.type === "block" && child.name === "WaveSpawn")
    .map((waveSpawnNode, index) => importWaveSpawnEntry(waveSpawnNode, index, warnings));

  warnUnsupportedBlocks(node, ["StartWaveOutput", "DoneOutput", "WaveSpawn"], "Wave", warnings);

  return createWave({
    description: getFieldValue(node, "Description") ?? "",
    sound: getFieldValue(node, "Sound") ?? "",
    waitWhenDone: getFieldValue(node, "WaitWhenDone") ?? "25",
    checkpoint: getFieldValue(node, "Checkpoint") ?? "Yes",
    waveSpawns,
    nextWaveSpawnId: waveSpawns.length + 1,
  });
}

function importWaveSpawnEntry(node, index, warnings) {
  const tankNode = findChildBlock(node, "Tank");
  const botNode = findChildBlock(node, "TFBot");
  const spawnerType = tankNode ? "Tank" : "TFBot";
  const waveSpawn = createWaveSpawn({
    name: getFieldValue(node, "Name") ?? "",
    spawnerType,
    where: getFieldValue(node, "Where") ?? "spawnbot",
    totalCount: getFieldValue(node, "TotalCount") ?? "1",
    maxActive: getFieldValue(node, "MaxActive") ?? getFieldValue(node, "TotalCount") ?? "1",
    spawnCount: getFieldValue(node, "SpawnCount") ?? "1",
    totalCurrency: getFieldValue(node, "TotalCurrency") ?? "0",
    waitBeforeStarting: getFieldValue(node, "WaitBeforeStarting") ?? "0",
    waitBetweenSpawns: getFieldValue(node, "WaitBetweenSpawns") ?? "0",
    support: Boolean(getFieldValue(node, "Support")),
    randomSpawn: Boolean(getFieldValue(node, "RandomSpawn")),
    tank: tankNode ? importTank(tankNode) : undefined,
  });

  if (!tankNode && !botNode) {
    warnings.push(`WaveSpawn ${index + 1} has no supported TFBot or Tank block.`);
  }

  warnUnsupportedBlocks(node, ["TFBot", "Tank"], `WaveSpawn ${index + 1}`, warnings);

  return {
    id: index + 1,
    label: waveSpawn.name || `Imported WaveSpawn ${index + 1}`,
    waveSpawn,
    bot: botNode ? importBot(botNode) : createBot(),
  };
}

function importBot(node) {
  return createBot({
    template: getFieldValue(node, "Template") ?? "",
    name: getFieldValue(node, "Name") ?? "",
    class: getFieldValue(node, "Class") ?? "",
    skill: getFieldValue(node, "Skill") ?? "",
    health: getFieldValue(node, "Health") ?? "",
    classIcon: getFieldValue(node, "ClassIcon") ?? "",
    scale: getFieldValue(node, "Scale") ?? "",
    attributes: getFieldValues(node, "Attributes"),
    weaponRestrictions: getFieldValue(node, "WeaponRestrictions") ?? "",
    behaviorModifiers: getFieldValue(node, "BehaviorModifiers") ?? "",
    tags: getFieldValues(node, "Tag"),
  });
}

function importTank(node) {
  return createTank({
    name: getFieldValue(node, "Name") ?? "tankboss",
    health: getFieldValue(node, "Health") ?? "20000",
    speed: getFieldValue(node, "Speed") ?? "75",
    skin: getFieldValue(node, "Skin") ?? "0",
    startingPathTrackNode: getFieldValue(node, "StartingPathTrackNode") ?? "boss_path_1",
  });
}

function findPopulationRoot(tree) {
  return tree.children.find((node) => node.type === "block" && node.name !== "Templates");
}

function inferMapId(root) {
  const wave = root.children.find((child) => child.type === "block" && child.name === "Wave");
  const startOutput = findChildBlock(wave, "StartWaveOutput");
  const doneOutput = findChildBlock(wave, "DoneOutput");
  const startTarget = getFieldValue(startOutput, "Target");
  const doneTarget = getFieldValue(doneOutput, "Target");

  const exactMatches = maps.filter((map) => map.startWaveOutput === startTarget && map.doneOutput === doneTarget);
  if (exactMatches.length === 1) {
    return exactMatches[0].id;
  }

  return exactMatches[0]?.id ?? "";
}

function findChildBlock(node, name) {
  return node?.children?.find((child) => child.type === "block" && child.name === name);
}

function getFieldValue(node, name) {
  return node?.children?.find((child) => child.type === "field" && child.name === name)?.value;
}

function getFieldValues(node, name) {
  return node?.children?.filter((child) => child.type === "field" && child.name === name).map((child) => child.value) ?? [];
}

function warnUnsupportedBlocks(node, supportedBlockNames, label, warnings) {
  const unsupported = node.children
    .filter((child) => child.type === "block" && !supportedBlockNames.includes(child.name))
    .map((child) => child.name);

  if (unsupported.length > 0) {
    warnings.push(`${label} contains unsupported nested block(s): ${[...new Set(unsupported)].join(", ")}.`);
  }
}

function normalizeYesNo(value) {
  return String(value).toLowerCase() === "yes" ? "yes" : "no";
}

