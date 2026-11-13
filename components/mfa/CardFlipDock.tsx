"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import type { GalleryImage } from "@/lib/gallery-data";

type CardFlipDockProps = {
  images: GalleryImage[];
  title: string;
};

export default function CardFlipDock({ images, title }: CardFlipDockProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const activeImage = images[activeIndex];

  const chooseImage = useCallback(
    (index: number, source?: HTMLButtonElement | null) => {
      if (index < 0 || index >= images.length || index === activeIndex) return;

      const stage = stageRef.current;
      const stageBounds = stage?.getBoundingClientRect();
      const sourceBounds = source?.getBoundingClientRect();
      const canAnimate =
        stageBounds &&
        sourceBounds &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const thumbnailImage = source?.querySelector("img");
      if (thumbnailImage?.naturalWidth && thumbnailImage.naturalHeight) {
        setAspectRatio(thumbnailImage.naturalWidth / thumbnailImage.naturalHeight);
      }

      if (canAnimate) {
        const flyingImage = document.createElement("img");
        flyingImage.src = images[index].src;
        flyingImage.alt = "";
        flyingImage.setAttribute("aria-hidden", "true");
        Object.assign(flyingImage.style, {
          position: "fixed",
          zIndex: "40",
          left: `${sourceBounds.left}px`,
          top: `${sourceBounds.top}px`,
          width: `${sourceBounds.width}px`,
          height: `${sourceBounds.height}px`,
          borderRadius: "5px",
          objectFit: "cover",
          pointerEvents: "none",
          transformOrigin: "top left",
        });
        document.body.appendChild(flyingImage);
        const animation = flyingImage.animate(
          [
            { transform: "translate3d(0, 0, 0) scale(1)", borderRadius: "5px" },
            {
              transform: `translate3d(${stageBounds.left - sourceBounds.left}px, ${stageBounds.top - sourceBounds.top}px, 0) scale(${stageBounds.width / sourceBounds.width}, ${stageBounds.height / sourceBounds.height})`,
              borderRadius: "8px",
            },
          ],
          {
            duration: 540,
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
          },
        );
        animation.onfinish = () => flyingImage.remove();
        animation.oncancel = () => flyingImage.remove();
      }

      setActiveIndex(index);
    },
    [activeIndex, images],
  );

  const magnifyAt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    thumbnailsRef.current.forEach((thumbnail) => {
      if (!thumbnail) return;
      const rect = thumbnail.getBoundingClientRect();
      const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
      const influence = Math.max(0, 1 - distance / 140);
      thumbnail.style.transform = `translateY(${-11 * influence}px) scale(${1 + 0.48 * influence})`;
      thumbnail.style.zIndex = influence > 0 ? "2" : "0";
    });
  };

  const resetMagnification = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    thumbnailsRef.current.forEach((thumbnail) => {
      if (!thumbnail) return;
      thumbnail.style.transform = "";
      thumbnail.style.zIndex = "";
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeIndex + delta + images.length) % images.length;
    chooseImage(nextIndex, thumbnailsRef.current[nextIndex]);
    thumbnailsRef.current[nextIndex]?.focus();
  };

  if (!activeImage) return null;

  return (
    <section className="card-flip-dock" aria-label={`${title} project images`}>
      <div className="card-flip-showcase">
        <div
          ref={stageRef}
          className="card-flip-stage"
          style={{ aspectRatio }}
        >
          <img
            key={activeImage.src}
            className="card-flip-image"
            src={activeImage.src}
            alt={activeImage.alt}
            decoding="async"
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth && naturalHeight) {
                setAspectRatio(naturalWidth / naturalHeight);
              }
            }}
          />
        </div>
        <div className="card-flip-title">
          <h2>{title}</h2>
          <p>Visual design · Selected work</p>
        </div>
      </div>
      <div className="card-flip-dock-area">
        <div
          className="card-flip-dock-list"
          aria-label="Choose a project image"
          onPointerMove={magnifyAt}
          onPointerLeave={resetMagnification}
          onKeyDown={handleKeyDown}
        >
          {images.map((image, index) => (
            <button
              type="button"
              key={image.src}
              ref={(element) => {
                thumbnailsRef.current[index] = element;
              }}
              className={`card-flip-thumb${index === activeIndex ? " is-active" : ""}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  chooseImage(index, event.currentTarget);
                }
              }}
              onFocus={(event) => chooseImage(index, event.currentTarget)}
              onClick={(event) => chooseImage(index, event.currentTarget)}
              aria-label={`Show image ${index + 1}: ${image.alt}`}
              aria-pressed={index === activeIndex}
            >
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </button>
          ))}
        </div>
        <div className="card-flip-dock-meta" aria-live="polite">
          <span>{activeImage.alt}</span>
          <span>
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
