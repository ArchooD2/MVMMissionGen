import {
  addWaveSpawnToWave,
  calculateWaveCurrency,
  removeWaveSpawnFromWave,
  updateWave,
} from "../state/createWave.js";
import { exportWave } from "../export/exportWave.js";
import { validateWave } from "../validation/validateWave.js";

export function renderWaveEditor(root, { wave, currentWaveSpawn, currentBot, spawnLocations = [], tankPaths = [], selectedMap = null, onChange }) {
  root.innerHTML = "";

  const controls = createElement("form", "panel controls");
  controls.addEventListener("submit", (event) => event.preventDefault());

  const previewStack = createElement("div", "preview-stack");
  root.append(controls, previewStack);

  renderControls(controls, wave, currentWaveSpawn, currentBot, onChange);
  renderValidation(controls, wave, spawnLocations, tankPaths);
  renderPreview(previewStack, "Current Wave Object", JSON.stringify(wave, null, 2));
  renderPreview(previewStack, "Wave Block Preview", exportWave(wave, 0, selectedMap));
}

function renderControls(root, wave, currentWaveSpawn, currentBot, onChange) {
  root.append(createHeading("Wave Settings"));

  const grid = createElement("div", "field-grid");
  root.append(grid);

  const summary = createElement("div", "summary-strip");
  summary.append(
    renderSummaryValue("WaveSpawns", wave.waveSpawns.length),
    renderSummaryValue("TotalCurrency", calculateWaveCurrency(wave)),
  );

  const addButton = createElement("button", "button");
  addButton.type = "button";
  addButton.textContent = "Add Current WaveSpawn";
  addButton.addEventListener("click", () => {
    onChange(addWaveSpawnToWave(wave, currentWaveSpawn, currentBot));
  });

  grid.append(
    summary,
    renderTextField({
      id: "wave-description",
      label: "Description",
      value: wave.description,
      onInput: (value) => onChange(updateWave(wave, { description: value })),
    }),
    renderTextField({
      id: "wave-sound",
      label: "Sound",
      value: wave.sound,
      onInput: (value) => onChange(updateWave(wave, { sound: value })),
    }),
    renderTextField({
      id: "wave-wait-when-done",
      label: "WaitWhenDone",
      value: wave.waitWhenDone,
      inputMode: "decimal",
      onInput: (value) => onChange(updateWave(wave, { waitWhenDone: value })),
    }),
    renderSelectField({
      id: "wave-checkpoint",
      label: "Checkpoint",
      value: wave.checkpoint,
      options: [
        { value: "", label: "Omit" },
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
      onInput: (value) => onChange(updateWave(wave, { checkpoint: value })),
    }),
    addButton,
    renderWaveSpawnList(wave, onChange),
  );
}

function renderWaveSpawnList(wave, onChange) {
  const wrapper = createElement("section", "snapshot-list");
  const title = createElement("div", "attribute-label");
  title.textContent = "WaveSpawn snapshots in this wave";
  wrapper.append(title);

  if (wave.waveSpawns.length === 0) {
    const empty = createElement("p", "empty-state");
    empty.textContent = "No WaveSpawns added yet.";
    wrapper.append(empty);
    return wrapper;
  }

  for (const entry of wave.waveSpawns) {
    const item = createElement("div", "snapshot-item");
    const text = createElement("div");
    const name = createElement("strong");
    name.textContent = entry.label;
    const detail = createElement("span");
    const spawnerName = entry.waveSpawn.spawnerType === "Tank"
      ? `tank ${entry.waveSpawn.tank.name || "tank"}`
      : (entry.bot.name || entry.bot.class || "bot");
    detail.textContent = `${entry.waveSpawn.totalCount || 0} ${entry.waveSpawn.spawnerType}, ${entry.waveSpawn.totalCurrency || 0} credits, ${spawnerName}`;
    text.append(name, detail);

    const remove = createElement("button", "button secondary");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => onChange(removeWaveSpawnFromWave(wave, entry.id)));

    item.append(text, remove);
    wrapper.append(item);
  }

  return wrapper;
}

function renderSummaryValue(label, value) {
  const item = createElement("div", "summary-item");
  const valueElement = createElement("strong");
  valueElement.textContent = value;
  const labelElement = createElement("span");
  labelElement.textContent = label;
  item.append(valueElement, labelElement);
  return item;
}

function renderValidation(root, wave, spawnLocations, tankPaths) {
  const validation = validateWave(wave, { spawnNames: spawnLocations.map((location) => location.id), tankPaths });
  const panel = createElement("section", "validation-panel");
  const title = createElement("h2");
  title.textContent = "Validation";
  panel.append(title);

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    const item = createElement("div", "validation-item ok");
    item.textContent = "Wave is valid for this milestone exporter.";
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

function renderPreview(root, title, content) {
  const panel = createElement("section", "panel preview-panel");
  panel.append(createHeading(title));

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



