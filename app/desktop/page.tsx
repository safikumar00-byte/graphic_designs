import { FolderDesktop } from "@/components/folder-desktop";
import { galleryCards } from "@/lib/gallery-data";

export default function DesktopPage() {
  return <FolderDesktop cards={galleryCards} />;
}
