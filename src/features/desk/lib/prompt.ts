/** "root" -> "~", "root/skills" -> "~/skills": the way zsh shows a path inside the home directory. */
export const shortPath = (path: string) => (path === "root" ? "~" : "~/" + path.replace(/^root\//, ""));
