import { missionPresets } from "../data/missionPresets.js";
import { addMission, createMissionFromPreset, removeMission, updateMission } from "../state/createMission.js";
import { exportMission } from "../export/exportMission.js";
import { validateMission } from "../validation/validateMission.js";

export function renderMissionEditor(root, { missions, spawnLocations = [], onChange }) {
  root.innerHTML = "";

  const controls = createElement("form", "panel controls");
  controls.addEventListener("submit", (event) => event.preventDefault());

  const previewStack = createElement("div", "preview-stack");
  root.append(controls, previewStack);

  renderControls(controls, missions, spawnLocations, onChange);
  renderValidation(controls, missions, spawnLocations);
  renderPreview(previewStack, "Current Missions Object", JSON.stringify(missions, null, 2));
  renderPreview(previewStack, "Mission Blocks Preview", missions.map((mission) => exportMission(mission)).join("\n\n"));
}

function renderControls(root, missions, spawnLocations, onChange) {
  root.append(createHeading("Mission Settings"));

  const grid = createElement("div", "field-grid");
  root.append(grid);

  const presetRow = createElement("div", "attribute-row");
  const presetSelect = createElement("select");
  presetSelect.id = "mission-preset";
  for (const preset of missionPresets) {
    presetSelect.append(new Option(preset.label, preset.id));
  }

  const addButton = createElement("button", "button");
  addButton.type = "button";
  addButton.textContent = "Add Mission";
  addButton.addEventListener("click", () => {
    onChange(addMission(missions, createMissionFromPreset(presetSelect.value, spawnLocations.map((location) => location.id))));
  });

  presetRow.append(presetSelect, addButton);
  grid.append(presetRow, renderMissionList(missions, spawnLocations, onChange));
}

function renderMissionList(missions, spawnLocations, onChange) {
  const wrapper = createElement("section", "snapshot-list");
  const title = createElement("div", "attribute-label");
  title.textContent = "Support missions";
  wrapper.append(title);

  if (missions.length === 0) {
    const empty = createElement("p", "empty-state");
    empty.textContent = "No support missions added yet.";
    wrapper.append(empty);
    return wrapper;
  }

  for (const mission of missions) {
    const item = createElement("div", "mission-card");
    const heading = createElement("div", "mission-card-heading");
    const titleText = createElement("strong");
    titleText.textContent = mission.label;
    const remove = createElement("button", "button secondary");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => onChange(removeMission(missions, mission.id)));
    heading.append(titleText, remove);

    const fields = createElement("div", "mission-grid");
    fields.append(
      renderSelectField({
        id: `mission-where-${mission.id}`,
        label: "Where",
        value: mission.where,
        options: spawnLocations.map((location) => ({ value: location.id, label: location.label })),
        onInput: (value) => onChange(updateMissionList(missions, mission.id, { where: value })),
      }),
      renderTextField({
        id: `mission-begin-${mission.id}`,
        label: "BeginAtWave",
        value: mission.beginAtWave,
        inputMode: "numeric",
        onInput: (value) => onChange(updateMissionList(missions, mission.id, { beginAtWave: value })),
      }),
      renderTextField({
        id: `mission-run-${mission.id}`,
        label: "RunForThisManyWaves",
        value: mission.runForThisManyWaves,
        inputMode: "numeric",
        onInput: (value) => onChange(updateMissionList(missions, mission.id, { runForThisManyWaves: value })),
      }),
      renderTextField({
        id: `mission-initial-${mission.id}`,
        label: "InitialCooldown",
        value: mission.initialCooldown,
        inputMode: "decimal",
        onInput: (value) => onChange(updateMissionList(missions, mission.id, { initialCooldown: value })),
      }),
      renderTextField({
        id: `mission-cooldown-${mission.id}`,
        label: "CooldownTime",
        value: mission.cooldownTime,
        inputMode: "decimal",
        onInput: (value) => onChange(updateMissionList(missions, mission.id, { cooldownTime: value })),
      }),
      renderTextField({
        id: `mission-count-${mission.id}`,
        label: "DesiredCount",
        value: mission.desiredCount,
        inputMode: "numeric",
        onInput: (value) => onChange(updateMissionList(missions, mission.id, { desiredCount: value })),
      }),
      renderTextField({
        id: `mission-teleport-${mission.id}`,
        label: "TeleportWhere",
        value: mission.teleportWhere,
        onInput: (value) => onChange(updateMissionList(missions, mission.id, { teleportWhere: value })),
      }),
    );

    const note = createElement("p", "template-note");
    note.textContent = `${mission.objective} using ${mission.bot.template}.`;
    item.append(heading, note, fields);
    wrapper.append(item);
  }

  return wrapper;
}

function updateMissionList(missions, missionId, patch) {
  return missions.map((mission) => mission.id === missionId ? updateMission(mission, patch) : mission);
}

function renderValidation(root, missions, spawnLocations) {
  const panel = createElement("section", "validation-panel");
  const title = createElement("h2");
  title.textContent = "Validation";
  panel.append(title);

  const errors = [];
  const warnings = [];
  missions.forEach((mission, index) => {
    const validation = validateMission(mission, { spawnNames: spawnLocations.map((location) => location.id) });
    for (const error of validation.errors) {
      errors.push(`Mission ${index + 1}: ${error}`);
    }
    for (const warning of validation.warnings) {
      warnings.push(`Mission ${index + 1}: ${warning}`);
    }
  });

  if (errors.length === 0 && warnings.length === 0) {
    const item = createElement("div", "validation-item ok");
    item.textContent = missions.length === 0 ? "No missions added." : "Missions are valid for this milestone exporter.";
    panel.append(item);
    root.append(panel);
    return;
  }

  if (errors.length > 0) {
    panel.append(renderValidationGroup("Errors", errors, "error"));
  }

  if (warnings.length > 0) {
    panel.append(renderValidationGroup("Warnings", warnings, "warning"));
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

function renderPreview(root, title, content) {
  const panel = createElement("section", "panel preview-panel");
  panel.append(createHeading(title));
  const pre = createElement("pre");
  pre.textContent = content || "No Mission blocks yet.";
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
