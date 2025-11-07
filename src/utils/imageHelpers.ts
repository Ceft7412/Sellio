import * as FileSystem from "expo-file-system/legacy";

/**
 * Convert image URI to base64 string
 * @param uri - Image URI from camera or gallery
 * @returns Base64 encoded string without data URI prefix
 */
export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    throw new Error("Failed to convert image to base64");
  }
};

/**
 * Get file extension from URI
 * @param uri - Image URI
 * @returns File extension (jpg, png, etc.)
 */
export const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([^.]+)$/);
  return match ? match[1] : "jpg";
};
