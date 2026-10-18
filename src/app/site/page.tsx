import type { Metadata } from "next";
import { Website } from "@/features/site/Website";
import { site } from "@/features/seo/site";

export const metadata: Metadata = {
  title: { absolute: `Projects and experience | ${site.name}` },
  description: `The scrolling version of ${site.name}'s portfolio: projects, experience, skills and education of a Karachi frontend engineer.`,
  alternates: { canonical: "/site" },
};

export default function SitePage() {
  return <Website />;
}
