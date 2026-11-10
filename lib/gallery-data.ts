export type GalleryImage = {
  src: string;
  alt: string;
};

export type GalleryCardData = {
  id: string;
  title: string;
  kind: "project" | "carousel";
  images: GalleryImage[];
};

function numberedImages(
  folder: string,
  filename: (number: number) => string,
  count: number,
  title: string,
): GalleryCardData[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const file = filename(number);
    return {
      id: `${folder}-${number}`,
      title,
      kind: "project",
      images: [{ src: `/${folder}/webp/${file}`, alt: `${title}, image ${number}` }],
    };
  });
}

function carousel(
  id: string,
  title: string,
  folder: string,
  filename: (number: number) => string,
  count: number,
): GalleryCardData {
  return {
    id,
    title,
    kind: "carousel",
    images: Array.from({ length: count }, (_, index) => {
      const number = index + 1;
      return {
        src: `/${folder}/webp/${filename(number)}`,
        alt: `${title}, slide ${number}`,
      };
    }),
  };
}

export const galleryCards: GalleryCardData[] = [
  ...numberedImages("QuantHexa", (number) => `quantHexa_${number}.webp`, 2, "QuantHexa"),
  ...numberedImages("ani_visa_services", (number) => `ani_${number}.webp`, 9, "Ani Visa Services"),
  carousel("insights-carousel", "Insights Carousel", "inights_carousel", (number) => `insights_carousel_${number}.webp`, 10),
  ...numberedImages("studentCare", (number) => `studnet_care_${number}.webp`, 20, "Student Care"),
  ...numberedImages("travellersBridge", (number) => `travellers_bridge_${number}.webp`, 11, "Travellers Bridge"),
  carousel("nortiqa-carousel", "Nortiqa", "nortiqa", (number) => `nortiqa_${number}.webp`, 11),
  carousel("tristone-carousel", "Tristone Creations", "tristoneCarouselBanners", (number) => `tristone_creations_${number}.webp`, 5),
];
