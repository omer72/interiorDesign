
/**
 * Converts a File object to a base64 encoded string, stripping the data URL prefix.
 * @param file The File object to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result includes a prefix like "data:image/jpeg;base64,", which we need to remove.
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a data URL string to a base64 encoded string, stripping the data URL prefix.
 * @param dataUrl The data URL string (e.g., "data:image/png;base64,iVBORw0KGgo...").
 * @returns The base64 string.
 */
export const dataUrlToBase64 = (dataUrl: string): string => {
  const parts = dataUrl.split(',');
  if (parts.length < 2 || !parts[0].startsWith('data:')) {
    console.warn("Invalid data URL format provided, returning original string.", dataUrl);
    return dataUrl; 
  }
  return parts[1];
};
