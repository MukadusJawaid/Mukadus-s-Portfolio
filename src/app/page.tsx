import { DeskExperience } from "@/features/desk";
import { JsonLd } from "@/features/seo/JsonLd";
import { SeoContent } from "@/features/seo/SeoContent";

export default function Home() {
  return (
    <>
      <DeskExperience />
      <SeoContent />
      <JsonLd />
    </>
  );
}
