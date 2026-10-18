import type { FolderInput } from "../../schemas/desk.schema";
import { about } from "./about";
import { education } from "./education";
import { experience } from "./experience";
import { intro } from "./intro";
import { projects } from "./projects";
import { skills } from "./skills";

/** Order matters: index 0 is the desk overview, the rest are folders on the desk. */
export const folders: FolderInput[] = [intro, skills, projects, experience, education, about];
