import { starterSpawnLocations } from "../data/spawnLocations.js";
import { updateTank } from "../state/createTank.js";
import { updateWaveSpawn } from "../state/createWaveSpawn.js";
import { exportWaveSpawn } from "../export/exportWaveSpawn.js";
import { validateWaveSpawn } from "../validation/validateWaveSpawn.js";

export function renderWaveSpawnEditor(root, { waveSpawn, bot, spawnLocations = starterSpawnLocations, tankPaths = [], onChange }) {
  root.innerHTML = "";

  const controls = createElement("form", "panel controls");
  controls.addEventListener("submit", (event) => event.preventDefault());

  const previewStack = createElement("div", "preview-stack");
  root.append(controls, previewStack);

  renderControls(controls, waveSpawn, bot, spawnLocations, tankPaths, onChange);
  renderValidation(controls, waveSpawn, bot, spawnLocations, tankPaths);
  renderPreview(previewStack, "Current WaveSpawn Object", JSON.stringify({ ...waveSpawn, bot }, null, 2));
  renderPreview(previewStack, "WaveSpawn Block Preview", exportWaveSpawn(waveSpawn, bot));
}

function renderControls(root, waveSpawn, bot, spawnLocations, tankPaths, onChange) {
  root.append(createHeading("WaveSpawn Settings"));

  const grid = createElement("div", "field-grid");
  root.append(grid);

  const botSummary = createElement("p", "template-note");
  botSummary.textContent = waveSpawn.spawnerType === "Tank"
    ? "Spawner uses the Tank fields below."
    : `Spawner uses current Bot Editor bot: ${bot.name || bot.template || bot.class || "Unnamed bot"}.`;

  grid.append(
    botSummary,
    renderSelectField({
      id: "wavespawn-spawner-type",
      label: "Spawner type",
      value: waveSpawn.spawnerType,
      options: [
        { value: "TFBot", label: "TFBot" },
        { value: "Tank", label: "Tank" },
      ],
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, value === "Tank" ? {
        spawnerType: value,
        totalCount: "1",
        maxActive: "1",
        spawnCount: "1",
      } : { spawnerType: value })),
    }),
    renderTextField({
      id: "wavespawn-name",
      label: "Name",
      value: waveSpawn.name,
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { name: value })),
    }),
    renderSelectField({
      id: "wavespawn-where",
      label: "Where",
      value: waveSpawn.where,
      options: spawnLocations.map((location) => ({ value: location.id, label: location.label })),
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { where: value })),
    }),
    renderTextField({
      id: "wavespawn-total-count",
      label: "TotalCount",
      value: waveSpawn.totalCount,
      inputMode: "numeric",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { totalCount: value })),
    }),
    renderTextField({
      id: "wavespawn-max-active",
      label: "MaxActive",
      value: waveSpawn.maxActive,
      inputMode: "numeric",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { maxActive: value })),
    }),
    renderTextField({
      id: "wavespawn-spawn-count",
      label: "SpawnCount",
      value: waveSpawn.spawnCount,
      inputMode: "numeric",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { spawnCount: value })),
    }),
    renderTextField({
      id: "wavespawn-total-currency",
      label: "TotalCurrency",
      value: waveSpawn.totalCurrency,
      inputMode: "numeric",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { totalCurrency: value })),
    }),
    renderTextField({
      id: "wavespawn-wait-before",
      label: "WaitBeforeStarting",
      value: waveSpawn.waitBeforeStarting,
      inputMode: "decimal",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { waitBeforeStarting: value })),
    }),
    renderTextField({
      id: "wavespawn-wait-between",
      label: "WaitBetweenSpawns",
      value: waveSpawn.waitBetweenSpawns,
      inputMode: "decimal",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { waitBetweenSpawns: value })),
    }),
    renderCheckboxField({
      id: "wavespawn-support",
      label: "Support",
      checked: waveSpawn.support,
      onInput: (checked) => onChange(updateWaveSpawn(waveSpawn, { support: checked })),
    }),
    renderCheckboxField({
      id: "wavespawn-random-spawn",
      label: "RandomSpawn",
      checked: waveSpawn.randomSpawn,
      onInput: (checked) => onChange(updateWaveSpawn(waveSpawn, { randomSpawn: checked })),
    }),
  );

  if (waveSpawn.spawnerType === "Tank") {
    grid.append(renderTankFields(waveSpawn, tankPaths, onChange));
  }
}

function renderTankFields(waveSpawn, tankPaths, onChange) {
  const wrapper = createElement("section", "tank-panel");
  const title = createElement("div", "attribute-label");
  title.textContent = "Tank";
  const grid = createElement("div", "mission-grid");
  const pathOptions = tankPaths.length > 0
    ? tankPaths.map((path) => ({ value: path, label: path }))
    : [{ value: waveSpawn.tank.startingPathTrackNode, label: waveSpawn.tank.startingPathTrackNode || "No known tank path" }];

  grid.append(
    renderTextField({
      id: "tank-name",
      label: "Name",
      value: waveSpawn.tank.name,
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { tank: updateTank(waveSpawn.tank, { name: value }) })),
    }),
    renderTextField({
      id: "tank-health",
      label: "Health",
      value: waveSpawn.tank.health,
      inputMode: "numeric",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { tank: updateTank(waveSpawn.tank, { health: value }) })),
    }),
    renderTextField({
      id: "tank-speed",
      label: "Speed",
      value: waveSpawn.tank.speed,
      inputMode: "decimal",
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { tank: updateTank(waveSpawn.tank, { speed: value }) })),
    }),
    renderSelectField({
      id: "tank-skin",
      label: "Skin",
      value: waveSpawn.tank.skin,
      options: [
        { value: "0", label: "0 normal" },
        { value: "1", label: "1 final wave" },
      ],
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { tank: updateTank(waveSpawn.tank, { skin: value }) })),
    }),
    renderSelectField({
      id: "tank-path",
      label: "StartingPathTrackNode",
      value: waveSpawn.tank.startingPathTrackNode,
      options: pathOptions,
      onInput: (value) => onChange(updateWaveSpawn(waveSpawn, { tank: updateTank(waveSpawn.tank, { startingPathTrackNode: value }) })),
    }),
  );

  wrapper.append(title, grid);
  return wrapper;
}
function renderValidation(root, waveSpawn, bot, spawnLocations, tankPaths) {
  const validation = validateWaveSpawn(waveSpawn, bot, { spawnNames: spawnLocations.map((location) => location.id), tankPaths });
  const panel = createElement("section", "validation-panel");
  const title = createElement("h2");
  title.textContent = "Validation";
  panel.append(title);

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    const item = createElement("div", "validation-item ok");
    item.textContent = "WaveSpawn is valid for this milestone exporter.";
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


