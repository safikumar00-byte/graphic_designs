import type { CSSProperties, ReactElement } from "react";

export type FlexCarouselItem = {
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  websiteUrl?: string;
};

type FlexCarouselProps = {
  items: FlexCarouselItem[];
  preset?: "liquid" | "ribbon" | "vortex" | "arch";
  intro?: "rise" | "bloom" | "spin" | "deal" | "none";
  cardHeight?: number;
  gap?: number;
  radius?: number;
  fit?: "natural" | "portrait" | "square" | "landscape";
  squeeze?: number;
  focusOnClick?: boolean;
  autoplay?: boolean;
  interval?: number;
  captions?: boolean;
  captureWheel?: boolean;
  onChange?: (index: number, item: FlexCarouselItem) => void;
  onSelect?: (index: number, item: FlexCarouselItem) => void;
  className?: string;
  style?: CSSProperties;
};

export default function FlexCarousel(props: FlexCarouselProps): ReactElement;
