/**
 * Generates a Google Favicon API URL for a given website URL.
 *
 * @param url - The website URL to get favicon for
 * @returns The Google Favicon API URL, or empty string if URL is invalid
 */
export const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return "";
  }
};
