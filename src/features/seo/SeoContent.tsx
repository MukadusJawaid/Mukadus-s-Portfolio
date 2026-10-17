import { folders } from "@/features/desk/data/folders";
import { site } from "./site";

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * A plain-text version of the whole portfolio. The 3D desk is a canvas, which search engines and
 * screen readers cannot read, so the same content is rendered here as real headings, paragraphs and
 * links. It is generated from the same data as the desk, so the two can never disagree. It is
 * visually hidden but available to search engines and assistive technology.
 */
export function SeoContent() {
  const bio = folders.find((f) => f.id === "about")?.files.find((f) => f.name === "bio.md");

  return (
    <article className="sr-only" aria-label={`About ${site.name}`}>
      <h1>{`${site.name}, ${site.jobTitle} in ${site.city}, ${site.country}`}</h1>
      {bio && <p>{bio.desc}</p>}

      {folders.slice(1).map((folder) => (
        <section key={folder.id}>
          <h2>{titleCase(folder.id)}</h2>
          <p>{folder.line}</p>
          {folder.badge && <p>{folder.badge}</p>}
          {folder.files.map((file) => (
            <div key={file.name}>
              <h3>{file.title ?? file.name}</h3>
              {file.meta && <p>{file.meta}</p>}
              <p>{file.desc}</p>
              {file.notes.length > 0 && (
                <ul>
                  {file.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
              {file.links.length > 0 && (
                <p>
                  {file.links.map((link) => (
                    <a key={link.slug} href={link.url}>
                      {link.t.replace(/\s*[↗↓]\s*$/, "")}
                    </a>
                  ))}
                </p>
              )}
            </div>
          ))}
        </section>
      ))}

      <p>
        {site.name} on <a href={site.social.github}>GitHub</a>, <a href={site.social.linkedin}>LinkedIn</a> and{" "}
        <a href={site.social.behance}>Behance</a>.
      </p>
    </article>
  );
}
