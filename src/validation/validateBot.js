import { tfClasses, skills } from "../data/classes.js";
import { hasClassIcon } from "../data/classIcons.js";
import { hasBotAttribute } from "../data/botAttributes.js";

const weaponRestrictions = ["MeleeOnly", "PrimaryOnly", "SecondaryOnly"];
const behaviorModifiers = ["Idler", "Mobber"];
const classAliases = new Map([
  ["demo", "Demoman"],
  ["demoman", "Demoman"],
  ["heavy", "HeavyWeapons"],
  ["heavyweapons", "HeavyWeapons"],
]);

export function validateBot(bot) {
  const errors = [];
  const warnings = [];
  const hasTemplate = Boolean(bot.template || bot.templateId);
  const normalizedClass = normalizeClassId(bot.class);

  if (!bot.class && !hasTemplate) {
    errors.push("Class is required unless a template is selected.");
  }

  if (bot.class && !tfClasses.some((tfClass) => tfClass.id === normalizedClass)) {
    errors.push(`Class "${bot.class}" is not one of the known TF2 classes.`);
  }

  if (bot.skill && !skills.includes(bot.skill)) {
    errors.push(`Skill "${bot.skill}" must be Easy, Normal, Hard, or Expert.`);
  }

  if (bot.health !== "" && (!Number.isFinite(Number(bot.health)) || Number(bot.health) <= 0)) {
    errors.push("Health must be a positive number when provided.");
  }

  if (bot.scale !== "" && (!Number.isFinite(Number(bot.scale)) || Number(bot.scale) <= 0)) {
    errors.push("Scale must be a positive number when provided.");
  }

  if (!bot.classIcon) {
    warnings.push("Class icon is empty; TF2 can load this, but the editor preview may be less specific.");
  } else if (!hasClassIcon(bot.classIcon)) {
    warnings.push(`Class icon "${bot.classIcon}" is not in the starter icon list.`);
  }

  if (bot.weaponRestrictions && !weaponRestrictions.includes(bot.weaponRestrictions)) {
    errors.push(`WeaponRestrictions "${bot.weaponRestrictions}" must be MeleeOnly, PrimaryOnly, or SecondaryOnly.`);
  }

  if (bot.behaviorModifiers && !behaviorModifiers.includes(bot.behaviorModifiers)) {
    errors.push(`BehaviorModifiers "${bot.behaviorModifiers}" must be Idler or Mobber.`);
  }

  const invalidAttributes = bot.attributes.filter((attribute) => !hasBotAttribute(attribute));
  if (invalidAttributes.length > 0) {
    errors.push(`Unknown attribute(s): ${uniqueValues(invalidAttributes).join(", ")}.`);
  }

  const duplicateAttributes = findDuplicates(bot.attributes);
  if (duplicateAttributes.length > 0) {
    warnings.push(`Duplicate attribute(s): ${duplicateAttributes.join(", ")}.`);
  }

  const invalidTags = bot.tags.filter((tag) => tag && !isPopIdentifier(tag));
  if (invalidTags.length > 0) {
    warnings.push(`Tag value(s) should be simple .pop identifiers: ${uniqueValues(invalidTags).join(", ")}.`);
  }

  const health = Number(bot.health);
  const hasGiantIcon = /giant/i.test(bot.classIcon);
  if (Number.isFinite(health) && health >= 1000 && bot.classIcon && !hasGiantIcon) {
    warnings.push("Bot has giant-like health but does not use a giant class icon.");
  }

  if (Number.isFinite(health) && health > 0 && health < 1000 && hasGiantIcon) {
    warnings.push("Bot uses a giant class icon but has non-giant-like health.");
  }

  return { errors, warnings };
}

function normalizeClassId(classId) {
  if (!classId) {
    return classId;
  }

  return classAliases.get(String(classId).toLowerCase()) ?? classId;
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates];
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function isPopIdentifier(value) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}


