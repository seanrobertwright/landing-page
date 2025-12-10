/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights matching text in a string by wrapping matches with <mark> tags
 * Returns an array of text segments with `highlight` flag
 */
export interface HighlightSegment {
  text: string;
  highlight: boolean;
}

export function highlightMatches(text: string, query: string): HighlightSegment[] {
  if (!query || query.trim().length === 0) {
    return [{ text, highlight: false }];
  }

  const escapedQuery = escapeRegex(query.trim());
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlight: regex.test(part),
    }));
}
