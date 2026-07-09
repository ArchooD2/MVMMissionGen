import { findMap, maps } from "../data/maps.js";
import { applyMapDefaults, updatePopulation } from "../state/createPopulation.js";
import { exportPopulation } from "../export/exportPopulation.js";
import { validatePopulation } from "../validation/validatePopulation.js";

export function renderPopulationEditor(root, { population, waves, wave, missions = [], onChange }) {
  root.innerHTML = "";

  const controls = createElement("form", "panel controls");
  controls.addEventListener("submit", (event) => event.preventDefault());

  const previewStack = createElement("div", "preview-stack");
  root.append(controls, previewStack);

  const waveList = waves ?? (wave ? [wave] : []);
  const validation = validatePopulation(population, waveList, missions);

  renderControls(controls, population, onChange);
  renderValidation(controls, validation);
  renderPreview(previewStack, "Current Population Object", JSON.stringify({ ...population, missions, waves: waveList }, null, 2));
  renderPreview(previewStack, "Population .pop Preview", exportPopulation(population, waveList, missions), validation);
}

function renderControls(root, population, onChange) {
  root.append(createHeading("Population Settings"));

  const selectedMap = findMap(population.mapId);
  const grid = createElement("div", "field-grid");
  root.append(grid);

  const mapNote = createElement("p", "template-note");
  mapNote.textContent = selectedMap
    ? `${selectedMap.displayName}: ${selectedMap.spawnNames.length} spawn names, ${selectedMap.tankPaths.length} tank path(s).`
    : "Choose a map to load starter map data.";

  grid.append(
    renderSelectField({
      id: "population-map",
      label: "Map",
      value: population.mapId,
      options: maps.map((map) => ({ value: map.id, label: `${map.displayName} (${map.fileName})` })),
      onInput: (value) => onChange(applyMapDefaults(population, value)),
    }),
    mapNote,
    renderTextField({
      id: "population-root-name",
      label: "Root block",
      value: population.rootName,
      onInput: (value) => onChange(updatePopulation(population, { rootName: value })),
    }),
    renderTextField({
      id: "population-starting-currency",
      label: "StartingCurrency",
      value: population.startingCurrency,
      inputMode: "numeric",
      onInput: (value) => onChange(updatePopulation(population, { startingCurrency: value })),
    }),
    renderTextField({
      id: "population-respawn-wave-time",
      label: "RespawnWaveTime",
      value: population.respawnWaveTime,
      inputMode: "decimal",
      onInput: (value) => onChange(updatePopulation(population, { respawnWaveTime: value })),
    }),
    renderSelectField({
      id: "population-bots-attack-spawn",
      label: "CanBotsAttackWhileInSpawnRoom",
      value: population.canBotsAttackWhileInSpawnRoom,
      options: [
        { value: "yes", label: "yes" },
        { value: "no", label: "no" },
      ],
      onInput: (value) => onChange(updatePopulation(population, { canBotsAttackWhileInSpawnRoom: value })),
    }),
    renderTextField({
      id: "population-event-popfile",
      label: "EventPopfile",
      value: population.eventPopfile,
      onInput: (value) => onChange(updatePopulation(population, { eventPopfile: value })),
    }),
    renderCheckboxField({
      id: "population-advanced",
      label: "Advanced",
      checked: population.advanced,
      onInput: (checked) => onChange(updatePopulation(population, { advanced: checked })),
    }),
    renderCheckboxField({
      id: "population-fixed-respawn",
      label: "FixedRespawnWaveTime",
      checked: population.fixedRespawnWaveTime,
      onInput: (checked) => onChange(updatePopulation(population, { fixedRespawnWaveTime: checked })),
    }),
    renderCheckboxField({
      id: "population-base-giant",
      label: "#base robot_giant.pop",
      checked: population.baseFiles.includes("robot_giant.pop"),
      onInput: (checked) => onChange(updateBaseFile(population, "robot_giant.pop", checked)),
    }),
    renderCheckboxField({
      id: "population-base-standard",
      label: "#base robot_standard.pop",
      checked: population.baseFiles.includes("robot_standard.pop"),
      onInput: (checked) => onChange(updateBaseFile(population, "robot_standard.pop", checked)),
    }),
  );
}

function updateBaseFile(population, baseFile, checked) {
  const baseFiles = checked
    ? [...new Set([...population.baseFiles, baseFile])]
    : population.baseFiles.filter((file) => file !== baseFile);
  return updatePopulation(population, { baseFiles });
}

function renderValidation(root, validation) {
  const panel = createElement("section", "validation-panel");
  const title = createElement("h2");
  title.textContent = "Full Mission Validation";
  const summary = createElement("p", "validation-summary");
  summary.textContent = `${validation.errors.length} error(s), ${validation.warnings.length} warning(s)`;
  panel.append(title, summary);

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    const item = createElement("div", "validation-item ok");
    item.textContent = "Mission shell is valid for this milestone exporter.";
    panel.append(item);
    root.append(panel);
    return;
  }

  if (validation.errors.length > 0) {
    panel.append(renderValidationGroup("Errors", validation.errors, "error"));
  }

  if (validation.warnings.length > 0) {
    panel.append(renderValidationGroup("Warnings", validation.warnings, "warning"));
  }

  root.append(panel);
}

function renderValidationGroup(title, messages, type) {
  const group = createElement("div", "validation-group");
  const heading = createElement("h3");
  heading.textContent = title;
  const list = createElement("ul", "validation-list");

  for (const message of messages) {
    const item = createElement("li", `validation-item ${type}`);
    item.textContent = message;
    list.append(item);
  }

  group.append(heading, list);
  return group;
}

function renderTextField({ id, label, value, inputMode, onInput }) {
  const field = createElement("div", "field");
  const labelElement = createElement("label");
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const input = createElement("input");
  input.id = id;
  input.value = value;
  input.inputMode = inputMode ?? "text";
  input.addEventListener("input", () => onInput(input.value));

  field.append(labelElement, input);
  return field;
}

function renderSelectField({ id, label, value, options, onInput }) {
  const field = createElement("div", "field");
  const labelElement = createElement("label");
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const select = createElement("select");
  select.id = id;

  for (const option of options) {
    select.append(new Option(option.label, option.value));
  }

  select.value = value;
  select.addEventListener("change", () => onInput(select.value));

  field.append(labelElement, select);
  return field;
}

function renderCheckboxField({ id, label, checked, onInput }) {
  const field = createElement("label", "checkbox-field");
  field.htmlFor = id;

  const input = createElement("input");
  input.id = id;
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", () => onInput(input.checked));

  const text = createElement("span");
  text.textContent = label;
  field.append(input, text);
  return field;
}

function renderPreview(root, title, content, validation = null) {
  const panel = createElement("section", "panel preview-panel");
  panel.append(createHeading(title));

  if (validation?.errors.length > 0 && title.includes(".pop")) {
    const warning = createElement("div", "export-blocked-note");
    warning.textContent = "Export has structural validation errors. Preview remains visible for debugging.";
    panel.append(warning);
  }

  const pre = createElement("pre");
  pre.textContent = content;
  panel.append(pre);

  root.append(panel);
}

function createHeading(title) {
  const heading = createElement("div", "panel-heading");
  const h2 = createElement("h2");
  h2.textContent = title;
  heading.append(h2);
  return heading;
}

function createElement(tagName, className = "") {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
}



