/**
 * Converts snake_case or camelCase strings to Title Case
 * Examples:
 * - "shoe_type" -> "Shoe Type"
 * - "like_new" -> "Like New"
 * - "brandName" -> "Brand Name"
 * - "good" -> "Good"
 */
export const toTitleCase = (str: string): string => {
  if (!str) return "";

  // Replace underscores and camelCase with spaces
  const spacedStr = str
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2"); // Add space before capital letters in camelCase

  // Capitalize first letter of each word
  return spacedStr
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Normalizes an object's keys and values to Title Case
 * Useful for displaying specs/attributes
 */
export const normalizeObject = (obj: any): Record<string, string> => {
  if (!obj || typeof obj !== "object") return {};

  const normalized: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const normalizedKey = toTitleCase(key);
    const normalizedValue =
      typeof value === "string" ? toTitleCase(value) : String(value);
    normalized[normalizedKey] = normalizedValue;
  });

  return normalized;
};
