import { z } from "zod";

export const fileLinkSchema = z.object({
  t: z.string(),
  slug: z.string(),
  url: z.string(),
  primary: z.boolean(),
});

export const deskFileSchema = z.object({
  name: z.string(),
  /** display title for the card; falls back to a tidied-up file name */
  title: z.string().optional(),
  size: z.string(),
  kind: z.string(),
  /** short line shown under the title, e.g. "Dec 2025 – Present · Front-End Engineer" */
  meta: z.string().optional(),
  /** the small summary */
  desc: z.string(),
  tags: z.array(z.string()),
  /** highlights shown when the card is expanded */
  notes: z.array(z.string()),
  links: z.array(fileLinkSchema),
});

export const folderSchema = z.object({
  id: z.string(),
  line: z.string(),
  /** short highlight shown as a pill next to the folder title, e.g. "2.5+ years experience" */
  badge: z.string().optional(),
  files: z.array(deskFileSchema),
});

export type FolderInput = z.input<typeof folderSchema>;
