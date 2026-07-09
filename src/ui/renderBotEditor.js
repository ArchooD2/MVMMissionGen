import { tfClasses, skills, weaponRestrictions, behaviorModifiers, findClass } from "../data/classes.js";
import { classIcons } from "../data/classIcons.js";
import { botAttributes } from "../data/botAttributes.js";
import { botTemplates, findBotTemplate } from "../data/botTemplates.js";
import { createBotFromTemplate, updateBot } from "../state/createBot.js";
import { exportBot } from "../export/exportBot.js";
import { validateBot } from "../validation/validateBot.js";

export function renderBotEditor(root, { bot, onChange }) {
  const focusState = captureFocus(root);
  root.innerHTML = "";

  const controls = createElement("form", "panel controls");
  controls.addEventListener("submit", (event) => event.preventDefault());

  const previewStack = createElement("div", "preview-stack");
  root.append(controls, previewStack);

  renderControls(controls, bot, onChange);
  renderValidation(controls, bot);
  renderPreview(previewStack, "Current Bot Object", JSON.stringify(bot, null, 2));
  renderPreview(previewStack, "TFBot Block Preview", exportBot(bot));
  restoreFocus(root, focusState);
}

function renderControls(root, bot, onChange) {
  root.append(createHeading("Bot Settings"));

  const grid = createElement("div", "field-grid");
  root.append(grid);

  grid.append(
    renderSelectField({
      id: "template",
      label: "Starter template",
      value: bot.templateId,
      options: [{ value: "", label: "Custom bot" }, ...botTemplates.map((template) => ({
        value: template.id,
        label: `${template.label} (${template.sourceTemplate})`,
      }))],
      onInput: (value) => {
        onChange(value ? createBotFromTemplate(value) : updateBot(bot, { templateId: "", template: "" }));
      },
    }),
  );

  const selectedTemplate = findBotTemplate(bot.templateId);
  const templateNote = createElement("p", "template-note");
  templateNote.textContent = selectedTemplate
    ? `Loaded from old template name ${selectedTemplate.sourceTemplate}. Field edits are exported as overrides.`
    : "Custom bot state is stored directly as a JavaScript object.";
  grid.append(templateNote);

  grid.append(
    renderSelectField({
      id: "class",
      label: "Class",
      value: bot.class,
      options: [{ value: "", label: "Select class" }, ...tfClasses.map((tfClass) => ({ value: tfClass.id, label: tfClass.label }))],
      onInput: (value) => {
        const tfClass = findClass(value);
        onChange(updateBot(bot, {
          class: value,
          classIcon: tfClass?.defaultIcon ?? bot.classIcon,
          health: tfClass?.defaultHealth ?? bot.health,
          templateId: "",
          template: "",
        }));
      },
    }),
    renderTextField({
      id: "name",
      label: "Bot name",
      value: bot.name,
      onInput: (value) => onChange(detachTemplate(bot, { name: value })),
    }),
    renderSelectField({
      id: "skill",
      label: "Skill",
      value: bot.skill,
      options: [{ value: "", label: "No skill" }, ...skills.map((skill) => ({ value: skill, label: skill }))],
      onInput: (value) => onChange(detachTemplate(bot, { skill: value })),
    }),
    renderTextField({
      id: "health",
      label: "Health",
      value: bot.health,
      inputMode: "decimal",
      onInput: (value) => onChange(detachTemplate(bot, { health: value })),
    }),
    renderSelectField({
      id: "classIcon",
      label: "Class icon",
      value: bot.classIcon,
      options: [{ value: "", label: "Select icon" }, ...classIcons.map((icon) => ({ value: icon.id, label: `${icon.label} (${icon.id})` }))],
      onInput: (value) => onChange(detachTemplate(bot, { classIcon: value })),
    }),
    renderTextField({
      id: "scale",
      label: "Scale",
      value: bot.scale,
      inputMode: "decimal",
      onInput: (value) => onChange(detachTemplate(bot, { scale: value })),
    }),
    renderSelectField({
      id: "weaponRestrictions",
      label: "WeaponRestrictions",
      value: bot.weaponRestrictions,
      options: weaponRestrictions.map((restriction) => ({ value: restriction, label: restriction || "None" })),
      onInput: (value) => onChange(detachTemplate(bot, { weaponRestrictions: value })),
    }),
    renderSelectField({
      id: "behaviorModifiers",
      label: "BehaviorModifiers",
      value: bot.behaviorModifiers,
      options: behaviorModifiers.map((modifier) => ({ value: modifier, label: modifier || "None" })),
      onInput: (value) => onChange(detachTemplate(bot, { behaviorModifiers: value })),
    }),
  );

  grid.append(renderAttributes(bot, onChange));
  grid.append(renderTags(bot, onChange));
}

function renderValidation(root, bot) {
  const validation = validateBot(bot);
  const panel = createElement("section", "validation-panel");
  const title = createElement("h2");
  title.textContent = "Validation";
  panel.append(title);

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    const item = createElement("div", "validation-item ok");
    item.textContent = "Bot is valid for this milestone exporter.";
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

function renderAttributes(bot, onChange) {
  const wrapper = createElement("section", "attributes-panel");
  const label = createElement("div", "attribute-label");
  label.textContent = "Bot attributes";

  const row = createElement("div", "attribute-row");
  const select = createElement("select");
  select.id = "attribute-picker";

  for (const attribute of botAttributes) {
    const option = new Option(`${attribute.label} (${attribute.id})`, attribute.id);
    select.append(option);
  }

  const addButton = createElement("button", "button secondary");
  addButton.type = "button";
  addButton.textContent = "Add";
  addButton.addEventListener("click", () => {
    if (select.value) {
      onChange(detachTemplate(bot, {
        attributes: [...bot.attributes, select.value],
      }));
    }
  });

  row.append(select, addButton);

  const list = createElement("div", "attribute-list");
  if (bot.attributes.length === 0) {
    const empty = createElement("span", "empty-state");
    empty.textContent = "No attributes added.";
    list.append(empty);
  }

  bot.attributes.forEach((attributeId, index) => {
    const chip = createElement("span", "attribute-chip");
    chip.append(document.createTextNode(attributeId));

    const remove = createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${attributeId}`);
    remove.textContent = "x";
    remove.addEventListener("click", () => {
      onChange(detachTemplate(bot, {
        attributes: bot.attributes.filter((_, attributeIndex) => attributeIndex !== index),
      }));
    });

    chip.append(remove);
    list.append(chip);
  });

  wrapper.append(label, row, list);
  return wrapper;
}

function renderTags(bot, onChange) {
  const wrapper = createElement("section", "attributes-panel");
  const label = createElement("div", "attribute-label");
  label.textContent = "Tags";

  const row = createElement("div", "attribute-row");
  const input = createElement("input");
  input.id = "tag-input";
  input.placeholder = "bot_giant";

  const addButton = createElement("button", "button secondary");
  addButton.type = "button";
  addButton.textContent = "Add";
  addButton.addEventListener("click", () => {
    const tag = input.value.trim();
    if (tag) {
      onChange(detachTemplate(bot, { tags: [...bot.tags, tag] }));
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addButton.click();
    }
  });

  row.append(input, addButton);

  const list = createElement("div", "attribute-list");
  if (bot.tags.length === 0) {
    const empty = createElement("span", "empty-state");
    empty.textContent = "No tags added.";
    list.append(empty);
  }

  bot.tags.forEach((tag, index) => {
    const chip = createElement("span", "attribute-chip");
    chip.append(document.createTextNode(tag));

    const remove = createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${tag}`);
    remove.textContent = "x";
    remove.addEventListener("click", () => {
      onChange(detachTemplate(bot, {
        tags: bot.tags.filter((_, tagIndex) => tagIndex !== index),
      }));
    });

    chip.append(remove);
    list.append(chip);
  });

  wrapper.append(label, row, list);
  return wrapper;
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

function captureFocus(root) {
  const activeElement = document.activeElement;
  if (!activeElement || !root.contains(activeElement) || !activeElement.id) {
    return null;
  }

  return {
    id: activeElement.id,
    selectionStart: activeElement.selectionStart,
    selectionEnd: activeElement.selectionEnd,
  };
}

function restoreFocus(root, focusState) {
  if (!focusState) {
    return;
  }

  const nextActiveElement = root.querySelector(`#${CSS.escape(focusState.id)}`);
  if (!nextActiveElement) {
    return;
  }

  nextActiveElement.focus({ preventScroll: true });

  if (typeof nextActiveElement.setSelectionRange === "function" && focusState.selectionStart !== null) {
    nextActiveElement.setSelectionRange(focusState.selectionStart, focusState.selectionEnd);
  }
}
function detachTemplate(bot, patch) {
  return updateBot(bot, patch);
}

function createElement(tagName, className = "") {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
}




