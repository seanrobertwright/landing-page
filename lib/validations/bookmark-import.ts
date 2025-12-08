import { z } from 'zod';

/**
 * Duplicate handling strategies for import
 */
export enum DuplicateStrategy {
  SKIP = 'skip',     // Skip if URL exists
  UPDATE = 'update', // Update existing bookmark
}

/**
 * Schema for import options
 */
export const importOptionsSchema = z.object({
  strategy: z.nativeEnum(DuplicateStrategy).default(DuplicateStrategy.SKIP),
});

/**
 * Schema for validating imported bookmark data
 */
export const bookmarkImportSchema = z.object({
  folders: z.array(
    z.object({
      tempId: z.string(),
      name: z.string().min(1).max(255),
      parentTempId: z.string().nullable(),
      depth: z.number().int().min(0),
    })
  ),
  links: z.array(
    z.object({
      title: z.string().min(1).max(500),
      url: z.string().url(),
      folderTempId: z.string(),
      addDate: z.number().optional(),
    })
  ),
});

/**
 * Schema for import file upload
 */
export const importFileSchema = z.object({
  file: z.instanceof(File),
  strategy: z.nativeEnum(DuplicateStrategy).optional(),
});

/**
 * Schema for import result
 */
export const importResultSchema = z.object({
  success: z.boolean(),
  stats: z.object({
    foldersAdded: z.number().int().min(0),
    linksAdded: z.number().int().min(0),
    linksUpdated: z.number().int().min(0),
    linksSkipped: z.number().int().min(0),
    errors: z.array(z.string()),
  }),
});

export type ImportOptions = z.infer<typeof importOptionsSchema>;
export type BookmarkImportData = z.infer<typeof bookmarkImportSchema>;
export type ImportFileInput = z.infer<typeof importFileSchema>;
export type ImportResult = z.infer<typeof importResultSchema>;

/**
 * Validate file size (max 50MB)
 */
export function validateFileSize(file: File): void {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 50MB');
  }
}

/**
 * Validate file type
 */
export function validateFileType(file: File): void {
  const validTypes = ['text/html', 'application/xhtml+xml'];
  if (!validTypes.includes(file.type) && !file.name.endsWith('.html')) {
    throw new Error('Invalid file type. Please upload an HTML bookmark export file');
  }
}
