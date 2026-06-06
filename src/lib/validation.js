import { getCopy, getLanguage } from "@/lib/i18n";
import { countryNameForCode, isValidCountryCode } from "@/lib/countries";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_STORY_TEXT_LENGTH = 12000;
export const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif"
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s().-]{6,24}$/;

export function cleanInput(value, maxLength = 500) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function cleanLongText(value) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function normalizeSubmissionFields(formData) {
  const selectedLanguage = getLanguage(cleanInput(formData.get("selectedLanguage"), 8)).code;
  const copy = getCopy(selectedLanguage);
  const storyText = cleanLongText(formData.get("storyText"));
  const values = {
    selectedLanguage,
    fullName: cleanInput(formData.get("fullName"), 160),
    phoneNumber: cleanInput(formData.get("phone"), 40),
    email: cleanInput(formData.get("email"), 254).toLowerCase(),
    country: cleanInput(formData.get("country"), 120),
    countryCode: cleanInput(formData.get("countryCode"), 2).toUpperCase(),
    storyText,
    honeypot: cleanInput(formData.get("website"), 120)
  };
  const errors = {};

  if (!values.fullName) errors.fullName = copy.required;
  if (!values.phoneNumber) errors.phone = copy.required;
  if (values.phoneNumber && !phonePattern.test(values.phoneNumber)) errors.phone = copy.invalidPhone;
  if (!values.email) errors.email = copy.required;
  if (values.email && !emailPattern.test(values.email)) errors.email = copy.invalidEmail;
  if (!values.country || !values.countryCode || !isValidCountryCode(values.countryCode)) {
    errors.country = copy.countryRequired || copy.required;
  } else {
    values.country = values.country || countryNameForCode(values.countryCode, selectedLanguage);
  }
  if (values.storyText.length > MAX_STORY_TEXT_LENGTH) {
    errors.storyText = (copy.storyTooLong || getCopy("en").storyTooLong).replace(
      "{limit}",
      MAX_STORY_TEXT_LENGTH.toLocaleString(selectedLanguage)
    );
  }

  return { values, errors, copy };
}

export function isUploadedFile(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.arrayBuffer === "function" &&
    typeof value.size === "number" &&
    value.size > 0
  );
}

export function validateImageFile(file, copy, requiredMessage) {
  if (!isUploadedFile(file)) {
    return requiredMessage || copy.required;
  }

  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return copy.imageOnly;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return copy.fileTooLarge;
  }

  return null;
}
