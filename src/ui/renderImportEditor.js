import { importPopText } from "../import/importPopText.js";

export function renderImportEditor(root, { draft, result, onDraftChange, onParse, onApply }) {
  root.innerHTML = "";

  const controls = createElement("form", "panel controls");
  controls.addEventListener("submit", (event) => event.preventDefault());

  const previewStack = createElement("div", "preview-stack");
  root.append(controls, previewStack);

  renderControls(controls, draft, onDraftChange, onParse, onApply, result);
  renderPreview(previewStack, "Import Summary", renderSummary(result));
  renderPreview(previewStack, "Imported State Preview", result ? JSON.stringify({
    population: result.population,
    missions: result.missions,
    wave: result.wave,
    bot: result.bot,
    waveSpawn: result.waveSpawn,
  }, null, 2) : "No import parsed yet.");
}

function renderControls(root, draft, onDraftChange, onParse, onApply, result) {
  root.append(createHeading("Import .pop"));

  const grid = createElement("div", "field-grid");
  root.append(grid);

  const textareaField = createElement("div", "field");
  const label = createElement("label");
  label.htmlFor = "import-pop-text";
  label.textContent = "Paste .pop text";
  const textarea = createElement("textarea", "import-textarea");
  textarea.id = "import-pop-text";
  textarea.spellcheck = false;
  textarea.value = draft;
  textarea.addEventListener("input", () => onDraftChange(textarea.value));
  textareaField.append(label, textarea);

  const actions = createElement("div", "import-actions");
  const fileInput = createElement("input");
  fileInput.id = "import-pop-file";
  fileInput.type = "file";
  fileInput.accept = ".pop,text/plain";
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    onDraftChange(text, { render: true });
  });

  const parseButton = createElement("button", "button");
  parseButton.type = "button";
  parseButton.textContent = "Parse Import";
  parseButton.addEventListener("click", () => {
    onDraftChange(textarea.value);
    onParse(importPopText(textarea.value));
  });

  const applyButton = createElement("button", "button secondary");
  applyButton.type = "button";
  applyButton.textContent = "Apply Supported Import";
  applyButton.disabled = !result;
  applyButton.addEventListener("click", () => {
    if (result) {
      onApply(result);
    }
  });

  actions.append(fileInput, parseButton, applyButton);
  grid.append(textareaField, actions, renderWarnings(result));
}

function renderWarnings(result) {
  const panel = createElement("section", "validation-panel import-warning-panel");
  const title = createElement("h2");
  title.textContent = "Import Warnings";
  panel.append(title);

  if (!result) {
    const item = createElement("div", "validation-item ok");
    item.textContent = "Paste or load a .pop file, then parse it.";
    panel.append(item);
    return panel;
  }

  if (result.warnings.length === 0) {
    const item = createElement("div", "validation-item ok");
    item.textContent = "No importer warnings for the supported subset.";
    panel.append(item);
    return panel;
  }

  const list = createElement("ul", "validation-list");
  for (const warning of result.warnings) {
    const item = createElement("li", "validation-item warning");
    item.textContent = warning;
    list.append(item);
  }
  panel.append(list);
  return panel;
}

function renderSummary(result) {
  if (!result) {
    return "No import parsed yet.";
  }

  return [
    `Root: ${result.summary.rootName || result.population.rootName}`,
    `Detected map: ${result.summary.importedMapId || result.population.mapId || "unknown"}`,
    `#base files: ${result.population.baseFiles.join(", ") || "none"}`,
    `Sample waves found: ${result.summary.waveCount}`,
    `Sample missions found: ${result.summary.missionCount}`,
    `Imported missions: ${result.summary.importedMissionCount}`,
    `Imported WaveSpawns from first wave: ${result.summary.importedWaveSpawnCount}`,
    `Warnings: ${result.warnings.length}`,
  ].join("\n");
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

