import { InteractiveGallery } from "@/components/interactive-gallery";
import { galleryCards } from "@/lib/gallery-data";

export default function Home() {
  return <InteractiveGallery cards={galleryCards} />;
}
