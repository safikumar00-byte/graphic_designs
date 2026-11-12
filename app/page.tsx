import { InteractiveGallery } from "@/components/interactive-gallery";
import { ProjectScrollStack } from "@/components/project-scroll-stack";
import { galleryCards } from "@/lib/gallery-data";

export default function Home() {
  return (
    <>
      <InteractiveGallery cards={galleryCards} />
      <ProjectScrollStack />
    </>
  );
}
