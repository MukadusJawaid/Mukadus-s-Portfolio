type FileLink = { t: string; slug: string; url: string; primary: boolean };

export type DeskFile = {
  name: string;
  /** display title for the card; falls back to a tidied-up file name */
  title?: string;
  size: string;
  kind: string;
  /** short line shown under the title, e.g. "Dec 2025 – Present · Front-End Engineer" */
  meta?: string;
  /** the small summary */
  desc: string;
  tags: string[];
  /** highlights shown when the card is expanded */
  notes: string[];
  links: FileLink[];
};

export type FolderInput = {
  id: string;
  line: string;
  /** short highlight shown as a pill next to the folder title, e.g. "2.5+ years experience" */
  badge?: string;
  files: DeskFile[];
};
