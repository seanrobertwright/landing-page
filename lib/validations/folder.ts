import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255),
  parent_id: z.string().uuid().nullable().optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const reorderFoldersSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      parent_id: z.string().uuid().nullable(),
      sort_order: z.number().int().min(0),
    })
  ).min(1),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type ReorderFoldersInput = z.infer<typeof reorderFoldersSchema>;
