import { site } from "./site";

/**
 * Structured data (schema.org) that tells search engines who this site is about: a Person, the
 * places they studied and work, and the profiles that confirm it is the same person.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        inLanguage: "en",
        publisher: { "@id": `${site.url}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: site.name,
        url: site.url,
        jobTitle: site.jobTitle,
        description: site.description,
        image: `${site.url}/opengraph-image`,
        address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: site.countryCode },
        worksFor: { "@type": "Organization", name: "Cloud Primero" },
        alumniOf: [
          { "@type": "CollegeOrUniversity", name: "Sir Syed University of Engineering & Technology" },
          { "@type": "EducationalOrganization", name: "Arena Multimedia" },
        ],
        knowsAbout: site.knowsAbout,
        sameAs: Object.values(site.social),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // `<` is escaped so the JSON can never close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
