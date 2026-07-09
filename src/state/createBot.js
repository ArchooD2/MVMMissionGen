import { findClass } from "../data/classes.js";
import { findBotTemplate } from "../data/botTemplates.js";

export function createBot(overrides = {}) {
  const tfClass = findClass(overrides.class ?? "Scout");

  return {
    templateId: overrides.templateId ?? "",
    template: overrides.template ?? "",
    name: overrides.name ?? tfClass?.label ?? "",
    class: overrides.class ?? tfClass?.id ?? "",
    skill: overrides.skill ?? "Normal",
    health: normalizeTextValue(overrides.health ?? tfClass?.defaultHealth ?? ""),
    classIcon: overrides.classIcon ?? tfClass?.defaultIcon ?? "",
    scale: normalizeTextValue(overrides.scale ?? ""),
    attributes: [...(overrides.attributes ?? [])],
    weaponRestrictions: overrides.weaponRestrictions ?? "",
    behaviorModifiers: overrides.behaviorModifiers ?? "",
    tags: [...(overrides.tags ?? [])],
  };
}

export function createBotFromTemplate(templateId) {
  const template = findBotTemplate(templateId);

  if (!template) {
    return createBot();
  }

  return createBot({
    ...template.bot,
    templateId: template.id,
    template: template.sourceTemplate,
  });
}

export function updateBot(bot, patch) {
  return createBot({
    ...bot,
    ...patch,
  });
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
