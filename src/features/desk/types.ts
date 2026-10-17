import type { z } from "zod";
import type { deskFileSchema, fileLinkSchema, folderSchema } from "./schemas/desk.schema";

export type FileLink = z.infer<typeof fileLinkSchema>;
export type DeskFile = z.infer<typeof deskFileSchema>;
export type Folder = z.infer<typeof folderSchema>;

export type TermLine =
  | { k: "cmd"; path: string; text: string }
  | { k: "dir"; name: string; count: number; desc: string; to: number }
  | { k: "file"; name: string; size: string; folder: string }
  | { k: "text" | "tags" | "ok" | "mute" | "err" | "link" | "meta"; text: string }
  | { k: "help"; name: string; desc: string }
  /** "Last login: ..." banner at the top of a fresh session */
  | { k: "login" };

export type DeskState = {
  /** index into folders; 0 is the desk overview */
  ch: number;
  /** last folder that was open, so the drawer keeps its content while it slides out */
  lastCh: number;
  /** open document index within the folder, -1 for none */
  file: number;
  /** the terminal panel is showing (it slides away while a folder is open, and can be brought back) */
  terminal: boolean;
  /** everything the visitor has done, kept like a real shell history */
  log: TermLine[];
};
