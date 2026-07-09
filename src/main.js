import { findMap } from "./data/maps.js";
import { createBot } from "./state/createBot.js";
import { updateMission } from "./state/createMission.js";
import { createPopulation } from "./state/createPopulation.js";
import { createWaveSpawn, updateWaveSpawn } from "./state/createWaveSpawn.js";
import { createWave } from "./state/createWave.js";
import { renderBotEditor } from "./ui/renderBotEditor.js";
import { renderImportEditor } from "./ui/renderImportEditor.js";
import { renderMissionEditor } from "./ui/renderMissionEditor.js";
import { renderPopulationEditor } from "./ui/renderPopulationEditor.js";
import { renderWaveEditor } from "./ui/renderWaveEditor.js";
import { renderWaveSpawnEditor } from "./ui/renderWaveSpawnEditor.js";
import { exportPopText } from "./export/exportPopText.js";

const root = document.querySelector("#app");
const editorTabs = [
  { id: "import", label: "Import", title: "Import .pop" },
  { id: "population", label: "Mission", title: "Population Editor" },
  { id: "missions", label: "Missions", title: "Mission Editor" },
  { id: "bot", label: "Bot", title: "Bot Editor" },
  { id: "wavespawn", label: "WaveSpawn", title: "WaveSpawn Editor" },
  { id: "wave", label: "Wave", title: "Wave Editor" },
];

let activeEditorId = "population";
let bot = createBot();
let waveSpawn = createWaveSpawn();
let waves = [createWave()];
let activeWaveIndex = 0;
let population = createPopulation();
let missions = [];
let importDraft = "";
let importResult = null;

function setBot(nextBot) {
  bot = nextBot;
  render();
}

function setWaveSpawn(nextWaveSpawn) {
  waveSpawn = nextWaveSpawn;
  render();
}

function setWave(nextWave) {
  waves = waves.map((wave, index) => index === activeWaveIndex ? nextWave : wave);
  render();
}

function setActiveWave(nextIndex) {
  if (nextIndex < 0 || nextIndex >= waves.length) {
    return;
  }
  activeWaveIndex = nextIndex;
  render();
}

function addWave() {
  waves = [...waves, createWave()];
  activeWaveIndex = waves.length - 1;
  render();
}

function removeWave(indexToRemove) {
  if (waves.length <= 1) {
    return;
  }
  waves = waves.filter((_, index) => index !== indexToRemove);
  activeWaveIndex = Math.min(activeWaveIndex, waves.length - 1);
  render();
}

function setMissions(nextMissions) {
  missions = nextMissions;
  render();
}

function setPopulation(nextPopulation) {
  population = nextPopulation;
  const spawnLocations = getMapSpawnLocations(population);
  const tankPaths = getMapTankPaths(population);
  if (spawnLocations.length > 0 && !spawnLocations.some((location) => location.id === waveSpawn.where)) {
    waveSpawn = updateWaveSpawn(waveSpawn, { where: spawnLocations[0].id });
  }
  if (tankPaths.length > 0 && !tankPaths.includes(waveSpawn.tank.startingPathTrackNode)) {
    waveSpawn = updateWaveSpawn(waveSpawn, {
      tank: { ...waveSpawn.tank, startingPathTrackNode: tankPaths[0] },
    });
  }
  missions = missions.map((mission) => {
    if (spawnLocations.some((location) => location.id === mission.where)) {
      return mission;
    }
    return updateMission(mission, { where: spawnLocations[0]?.id ?? mission.where });
  });
  render();
}

function setImportDraft(nextDraft, options = {}) {
  importDraft = nextDraft;
  if (options.render) {
    render();
  }
}

function setImportResult(nextResult) {
  importResult = nextResult;
  render();
}

function applyImport(result) {
  population = result.population;
  missions = result.missions;
  waves = result.waves ?? [result.wave];
  activeWaveIndex = 0;
  bot = result.bot;
  waveSpawn = result.waveSpawn;
  activeEditorId = "population";
  render();
}

function setActiveEditor(nextEditorId) {
  if (activeEditorId === nextEditorId || !editorTabs.some((tab) => tab.id === nextEditorId)) {
    return;
  }

  activeEditorId = nextEditorId;
  render();
}

function exportPopulation() {
  const text = exportPopText({ population, missions, waves });
  const filename = `${population.mapId || "mission"}_custom.pop`;
  downloadTextFile(filename, text);
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function render() {
  const focusState = captureFocus(root);
  const selectedMap = findMap(population.mapId);
  const wave = waves[activeWaveIndex] ?? waves[0] ?? createWave();
  const spawnLocations = getMapSpawnLocations(population);
  const tankPaths = getMapTankPaths(population);
  root.innerHTML = "";

  const tabShell = createElement("section", "tab-shell");
  const tabBar = renderTabBar();
  const activeTab = editorTabs.find((tab) => tab.id === activeEditorId) ?? editorTabs[0];
  const activeSection = createEditorSection(activeTab.title, activeTab.id);

  renderActiveEditor(activeTab.id, activeSection.content, {
    selectedMap,
    wave,
    spawnLocations,
    tankPaths,
  });

  tabShell.append(tabBar, activeSection.section);
  root.append(tabShell);
  restoreFocus(root, focusState);
}

function renderActiveEditor(editorId, content, context) {
  switch (editorId) {
    case "import":
      renderImportEditor(content, {
        draft: importDraft,
        result: importResult,
        onDraftChange: setImportDraft,
        onParse: setImportResult,
        onApply: applyImport,
      });
      break;
    case "population":
      renderPopulationEditor(content, {
        population,
        waves,
        missions,
        onChange: setPopulation,
        onExport: exportPopulation,
      });
      break;
    case "missions":
      renderMissionEditor(content, {
        missions,
        spawnLocations: context.spawnLocations,
        onChange: setMissions,
      });
      break;
    case "bot":
      renderBotEditor(content, {
        bot,
        onChange: setBot,
      });
      break;
    case "wavespawn":
      renderWaveSpawnEditor(content, {
        waveSpawn,
        bot,
        spawnLocations: context.spawnLocations,
        tankPaths: context.tankPaths,
        onChange: setWaveSpawn,
      });
      break;
    case "wave":
      renderWaveEditor(content, {
        wave: context.wave,
        waves,
        activeWaveIndex,
        currentWaveSpawn: waveSpawn,
        currentBot: bot,
        spawnLocations: context.spawnLocations,
        tankPaths: context.tankPaths,
        selectedMap: context.selectedMap,
        onChange: setWave,
        onSelectWave: setActiveWave,
        onAddWave: addWave,
        onRemoveWave: removeWave,
      });
      break;
  }
}

function renderTabBar() {
  const tabBar = createElement("div", "editor-tab-bar");
  tabBar.role = "tablist";
  tabBar.setAttribute("aria-label", "Mission editor sections");

  for (const tab of editorTabs) {
    const button = createElement("button", "editor-tab");
    const isActive = tab.id === activeEditorId;
    button.type = "button";
    button.id = `tab-${tab.id}`;
    button.role = "tab";
    button.textContent = tab.label;
    button.dataset.tabId = tab.id;
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("aria-controls", `tabpanel-${tab.id}`);
    button.tabIndex = isActive ? 0 : -1;

    if (isActive) {
      button.classList.add("activatedTab");
    }

    const count = getTabCount(tab.id);
    if (count !== null) {
      const badge = createElement("span", "tab-count");
      badge.textContent = String(count);
      button.append(badge);
    }

    button.addEventListener("click", () => setActiveEditor(tab.id));
    button.addEventListener("keydown", handleTabKeydown);
    tabBar.append(button);
  }

  return tabBar;
}

function handleTabKeydown(event) {
  const currentIndex = editorTabs.findIndex((tab) => tab.id === activeEditorId);
  let nextIndex = currentIndex;

  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % editorTabs.length;
  } else if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + editorTabs.length) % editorTabs.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = editorTabs.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  setActiveEditor(editorTabs[nextIndex].id);
}

function getTabCount(tabId) {
  switch (tabId) {
    case "missions":
      return missions.length;
    case "wave":
      return waves.length;
    default:
      return null;
  }
}

function getMapSpawnLocations(currentPopulation) {
  const selectedMap = findMap(currentPopulation.mapId);
  return (selectedMap?.spawnNames ?? ["spawnbot"]).map((spawnName) => ({
    id: spawnName,
    label: spawnName,
  }));
}

function getMapTankPaths(currentPopulation) {
  const selectedMap = findMap(currentPopulation.mapId);
  return selectedMap?.tankPaths ?? [];
}

function createEditorSection(title, id) {
  const section = createElement("section", "app-section tab-pane");
  section.id = `tabpanel-${id}`;
  section.role = "tabpanel";
  section.setAttribute("aria-labelledby", `tab-${id}`);

  const heading = createElement("h2", "section-title");
  heading.textContent = title;

  const content = createElement("div", "editor-layout");

  section.append(heading, content);
  return { section, content };
}

function captureFocus(container) {
  const activeElement = document.activeElement;
  if (!activeElement || !container.contains(activeElement) || !activeElement.id) {
    return null;
  }

  return {
    id: activeElement.id,
    selectionStart: activeElement.selectionStart,
    selectionEnd: activeElement.selectionEnd,
  };
}

function restoreFocus(container, focusState) {
  if (!focusState) {
    return;
  }

  const nextActiveElement = container.querySelector(`#${CSS.escape(focusState.id)}`);
  if (!nextActiveElement) {
    return;
  }

  nextActiveElement.focus({ preventScroll: true });

  if (typeof nextActiveElement.setSelectionRange === "function" && focusState.selectionStart !== null) {
    nextActiveElement.setSelectionRange(focusState.selectionStart, focusState.selectionEnd);
  }
}

function createElement(tagName, className = "") {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
}

render();


