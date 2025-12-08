import { z } from 'zod';

export const createLinkSchema = z.object({
  title: z.string().min(1, 'Link title is required').max(255),
  url: z.string().url('Invalid URL format'),
  folder_id: z.string().uuid('Invalid folder ID'),
  favicon_url: z.string().url().nullable().optional(),
});

export const updateLinkSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  folder_id: z.string().uuid().optional(),
  favicon_url: z.string().url().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const reorderLinksSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      folder_id: z.string().uuid(),
      sort_order: z.number().int().min(0),
    })
  ).min(1),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type ReorderLinksInput = z.infer<typeof reorderLinksSchema>;
