import { FolderDesktop } from "@/components/folder-desktop";
import { InteractiveGallery } from "@/components/interactive-gallery";
import { ProjectScrollStack } from "@/components/project-scroll-stack";
import { galleryCards } from "@/lib/gallery-data";
import { QuickLivePreviews } from "@/components/quick-live-previews";


export default function Home() {
  return (
    <>
      {/* <InteractiveGallery cards={galleryCards} /> */}
      <FolderDesktop cards={galleryCards} />
      <ProjectScrollStack />
      <QuickLivePreviews />
    </>
  );
}
