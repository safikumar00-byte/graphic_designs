"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  memo,
  useRef,
  useState,
} from "react";
import type { GalleryCardData, GalleryImage } from "@/lib/gallery-data";
import LiquidRevealCursor from "@/components/mfa/LiquidRevealCursor";

const COLUMN_COUNT = 4;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const DEFAULT_SETTINGS: GallerySettings = {
  itemGap: 20,
  hoverScale: 1.05,
  expandedScale: 0.4,
  dragEase: 0.025,
  momentumFactor: 10,
  bufferZone: 1,
  borderRadius: 0,
  vignetteStrength: 0.7,
  vignetteSize: 1000,
  overlayOpacity: 0.9,
  overlayEaseDuration: 0.8,
  zoomDuration: 0.6,
};
const IMAGE_SIZES = [
  { width: 320, height: 400, ratio: 4 / 5 },
  { width: 225, height: 400, ratio: 9 / 16 },
  { width: 400, height: 225, ratio: 16 / 9 },
  { width: 400, height: 400, ratio: 1 },
];

type Transform = { x: number; y: number; scale: number };
type Viewport = { width: number; height: number };
type GallerySettings = {
  itemGap: number;
  hoverScale: number;
  expandedScale: number;
  dragEase: number;
  momentumFactor: number;
  bufferZone: number;
  borderRadius: number;
  vignetteStrength: number;
  vignetteSize: number;
  overlayOpacity: number;
  overlayEaseDuration: number;
  zoomDuration: number;
};
type GridPosition = { col: number; row: number; card: GalleryCardData };
type VisibleGrid = { key: string; positions: GridPosition[] };
type RevealImage = { image: GalleryImage; bounds: DOMRect };
type DragState = {
  pointerId: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  moved: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function closestImageSize(width: number, height: number) {
  const ratio = width / height;
  return IMAGE_SIZES.reduce((closest, candidate) =>
    Math.abs(Math.log(ratio / candidate.ratio)) <
    Math.abs(Math.log(ratio / closest.ratio))
      ? candidate
      : closest,
  );
}

function shuffleIndices(length: number, previousFirst = -1) {
  const order = Array.from({ length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }
  if (order.length > 1 && order[0] === previousFirst) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

function shuffleCards(cards: GalleryCardData[]) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function getVisibleGrid(
  cards: GalleryCardData[],
  viewport: Viewport,
  transform: Transform,
  settings: GallerySettings,
): VisibleGrid {
  if (!viewport.width || !viewport.height || !cards.length) {
    return { key: "", positions: [] };
  }

  const visibleWidth = viewport.width / transform.scale;
  const visibleHeight = viewport.height / transform.scale;
  const bufferX = (visibleWidth * settings.bufferZone) / 2;
  const bufferY = (visibleHeight * settings.bufferZone) / 2;
  const cellWidth = IMAGE_SIZES[3].width + settings.itemGap;
  const cellHeight = IMAGE_SIZES[3].height + settings.itemGap;
  const startCol = Math.floor((-transform.x - visibleWidth / 2 - bufferX) / cellWidth);
  const endCol = Math.ceil((-transform.x + visibleWidth / 2 + bufferX) / cellWidth);
  const startRow = Math.floor((-transform.y - visibleHeight / 2 - bufferY) / cellHeight);
  const endRow = Math.ceil((-transform.y + visibleHeight / 2 + bufferY) / cellHeight);
  const key = `${settings.itemGap}:${settings.bufferZone}:${startCol}:${endCol}:${startRow}:${endRow}`;
  const positions: GridPosition[] = [];

  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      const index = ((row * COLUMN_COUNT + col) % cards.length + cards.length) % cards.length;
      positions.push({ col, row, card: cards[index] });
    }
  }

  return { key, positions };
}

const GalleryTile = memo(function GalleryTile({
  card,
  col,
  row,
  number,
  itemGap,
  onExpand,
  onReveal,
  onHideReveal,
}: GridPosition & {
  number: number;
  itemGap: number;
  onExpand: (image: GalleryImage, title: string) => void;
  onReveal: (image: GalleryImage, bounds: DOMRect) => void;
  onHideReveal: () => void;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [size, setSize] = useState(IMAGE_SIZES[3]);
  const [imageError, setImageError] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState("");
  const image = card.images[slideIndex];

  useEffect(() => {
    if (card.kind !== "carousel" || card.images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let order = shuffleIndices(card.images.length);
    let position = 0;
    let previousIndex = order[0];
    setSlideIndex(previousIndex);

    const timer = window.setInterval(() => {
      position += 1;
      if (position === order.length) {
        order = shuffleIndices(card.images.length, previousIndex);
        position = 0;
      }
      previousIndex = order[position];
      setSlideIndex(previousIndex);
      setImageError(false);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [card]);

  function updateSize(event: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth && naturalHeight) {
      setSize(closestImageSize(naturalWidth, naturalHeight));
    }
  }

  const cellWidth = IMAGE_SIZES[3].width + itemGap;
  const cellHeight = IMAGE_SIZES[3].height + itemGap;
  const left = col * cellWidth + (cellWidth - size.width) / 2;
  const top = row * cellHeight + (cellHeight - size.height) / 2;
  const imageIsLoaded = loadedSrc === image.src;

  return (
    <button
      className="gallery-item"
      type="button"
      style={{ left, top, width: size.width, height: size.height }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          onReveal(image, event.currentTarget.getBoundingClientRect());
        }
      }}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") {
          onReveal(image, event.currentTarget.getBoundingClientRect());
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onHideReveal();
      }}
      onClick={() => onExpand(image, card.title)}
      aria-label={`Open ${card.title}`}
    >
      <span className="item-image-container">
        {!imageError && (
          <span
            className={`image-skeleton${imageIsLoaded ? " is-loaded" : ""}`}
            aria-hidden="true"
          />
        )}
        {!imageError ? (
          <img
            key={image.src}
            className={`item-image${imageIsLoaded ? " is-loaded" : ""}`}
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={(event) => {
              updateSize(event);
              setLoadedSrc(image.src);
            }}
            onError={() => {
              setImageError(true);
              setLoadedSrc("");
            }}
          />
        ) : (
          <span className="image-error">Image could not be loaded</span>
        )}
        {card.kind === "carousel" && (
          <span className="carousel-mark">
            <span className="carousel-dot" />
            Collection
          </span>
        )}
        <span className="item-caption">
          <span className="item-name">{card.title}</span>
          <span className="item-number">#{String(number).padStart(3, "0")}</span>
        </span>
      </span>
    </button>
  );
});

export function InteractiveGallery({ cards }: { cards: GalleryCardData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const transformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const targetTransformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const publishedTransformRef = useRef<Transform>(transformRef.current);
  const settingsRef = useRef(DEFAULT_SETTINGS);
  const viewportRef = useRef<Viewport>({ width: 0, height: 0 });
  const cardsRef = useRef(cards);
  const gridKeyRef = useRef("");
  const momentumFrameRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [transform, setTransform] = useState<Transform>(transformRef.current);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [shuffledCards, setShuffledCards] = useState(cards);
  const [positions, setPositions] = useState<GridPosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expanded, setExpanded] = useState<{ image: GalleryImage; title: string } | null>(null);
  const [isClosingExpanded, setIsClosingExpanded] = useState(false);
  const [revealImage, setRevealImage] = useState<RevealImage | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);

  const applyTransform = useCallback((next: Transform) => {
    targetTransformRef.current = {
      ...next,
      scale: clamp(next.scale, MIN_ZOOM, MAX_ZOOM),
    };
  }, []);

  settingsRef.current = settings;
  viewportRef.current = viewport;
  cardsRef.current = shuffledCards;

  useEffect(() => {
    document.documentElement.style.setProperty("--radius", `${settings.borderRadius}px`);
    document.documentElement.style.setProperty("--hover-scale", String(settings.hoverScale));
    document.documentElement.style.setProperty("--vignette-strength", String(settings.vignetteStrength));
    document.documentElement.style.setProperty("--vignette-size", `${settings.vignetteSize}px`);
    document.documentElement.style.setProperty("--overlay-opacity", String(settings.overlayOpacity));
    document.documentElement.style.setProperty("--overlay-duration", `${settings.overlayEaseDuration}s`);
    document.documentElement.style.setProperty("--zoom-duration", `${settings.zoomDuration}s`);
  }, [settings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateViewport = () => {
      const bounds = container.getBoundingClientRect();
      setViewport((current) =>
        current.width === bounds.width && current.height === bounds.height
          ? current
          : { width: bounds.width, height: bounds.height },
      );
    };

    updateViewport();
    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateViewport);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    gridKeyRef.current = "";
    setShuffledCards(shuffleCards(cards));
  }, [cards]);

  useEffect(() => {
    let active = true;
    let lastUiUpdate = 0;
    const animate = (time: number) => {
      if (!active) return;
      const current = transformRef.current;
      const target = targetTransformRef.current;
      const ease = settingsRef.current.dragEase;
      const next = {
        x: current.x + (target.x - current.x) * ease,
        y: current.y + (target.y - current.y) * ease,
        scale: current.scale + (target.scale - current.scale) * 0.12,
      };
      const settled =
        Math.abs(target.x - next.x) < 0.05 &&
        Math.abs(target.y - next.y) < 0.05 &&
        Math.abs(target.scale - next.scale) < 0.0005;
      if (settled) {
        next.x = target.x;
        next.y = target.y;
        next.scale = target.scale;
      }

      if (next.x !== current.x || next.y !== current.y || next.scale !== current.scale) {
        transformRef.current = next;
        if (canvasRef.current) {
          canvasRef.current.style.transform =
            `translate(${next.x}px, ${next.y}px) scale(${next.scale})`;
        }
      }
      const grid = getVisibleGrid(
        cardsRef.current,
        viewportRef.current,
        next,
        settingsRef.current,
      );
      if (grid.key !== gridKeyRef.current) {
        gridKeyRef.current = grid.key;
        setPositions(grid.positions);
      }
      const published = publishedTransformRef.current;
      if (
        time - lastUiUpdate >= 100 &&
        (Math.abs(next.x - published.x) > 1 ||
          Math.abs(next.y - published.y) > 1 ||
          Math.abs(next.scale - published.scale) > 0.001)
      ) {
        lastUiUpdate = time;
        publishedTransformRef.current = next;
        setTransform(next);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      active = false;
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, nextScale: number) => {
      if (!containerRef.current || expanded) return;
      const bounds = containerRef.current.getBoundingClientRect();
      const pointX = clientX - bounds.left - bounds.width / 2;
      const pointY = clientY - bounds.top - bounds.height / 2;
      const current = targetTransformRef.current;
      const scale = clamp(nextScale, MIN_ZOOM, MAX_ZOOM);
      const ratio = scale / current.scale;
      applyTransform({
        x: pointX - (pointX - current.x) * ratio,
        y: pointY - (pointY - current.y) * ratio,
        scale,
      });
    },
    [applyTransform, expanded],
  );

  const zoomAtCenter = useCallback(
    (nextScale: number) => {
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      zoomAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, nextScale);
    },
    [zoomAt],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      zoomAt(event.clientX, event.clientY, targetTransformRef.current.scale * factor);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  const stopMomentum = useCallback(() => {
    if (momentumFrameRef.current !== null) {
      cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (expanded || (event.pointerType === "mouse" && event.button !== 0)) return;
    stopMomentum();
    dragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocityX: 0,
      velocityY: 0,
      moved: false,
    };
    setIsDragging(true);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      if (!drag.moved && event.currentTarget.hasPointerCapture(event.pointerId) === false) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      drag.moved = true;
    }
    const now = performance.now();
    const elapsed = Math.max(10, now - drag.lastTime);
    const current = targetTransformRef.current;
    drag.velocityX = (dx / elapsed) / current.scale;
    drag.velocityY = (dy / elapsed) / current.scale;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    applyTransform({
      ...current,
      x: current.x + dx / current.scale,
      y: current.y + dy / current.scale,
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);

    suppressClickRef.current = drag.moved;
    if (drag.moved) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    if (!drag.moved) return;
    let velocityX = drag.velocityX * settingsRef.current.momentumFactor;
    let velocityY = drag.velocityY * settingsRef.current.momentumFactor;
    let previousTime = performance.now();
    const animateMomentum = (time: number) => {
      const elapsed = Math.min(32, time - previousTime);
      previousTime = time;
      const current = targetTransformRef.current;
      applyTransform({
        ...current,
        x: current.x + velocityX * elapsed,
        y: current.y + velocityY * elapsed,
      });
      const decay = Math.pow(0.92, elapsed / 16);
      velocityX *= decay;
      velocityY *= decay;
      if (Math.hypot(velocityX, velocityY) > 0.008) {
        momentumFrameRef.current = requestAnimationFrame(animateMomentum);
      } else {
        momentumFrameRef.current = null;
      }
    };
    momentumFrameRef.current = requestAnimationFrame(animateMomentum);
  };

  const resetView = useCallback(() => {
    stopMomentum();
    applyTransform({ x: 0, y: 0, scale: 1 });
  }, [applyTransform, stopMomentum]);

  const closeExpanded = useCallback(() => {
    if (!expanded || isClosingExpanded) return;
    setIsClosingExpanded(true);
    closeTimerRef.current = window.setTimeout(() => {
      setExpanded(null);
      setIsClosingExpanded(false);
      closeTimerRef.current = null;
    }, 450);
  }, [expanded, isClosingExpanded]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeExpanded();
      if (event.key.toLowerCase() === "h") setSettingsOpen((open) => !open);
      if (expanded) return;
      if (event.key === "+" || event.key === "=") {
        zoomAtCenter(targetTransformRef.current.scale * 1.15);
      }
      if (event.key === "-") {
        zoomAtCenter(targetTransformRef.current.scale / 1.15);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeExpanded, expanded, zoomAtCenter]);

  useEffect(
    () => () => {
      stopMomentum();
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (revealTimeoutRef.current !== null) window.clearTimeout(revealTimeoutRef.current);
    },
    [stopMomentum],
  );

  const settingSlider = (
    key: keyof GallerySettings,
    label: string,
    min: number,
    max: number,
    step: number,
  ) => (
    <label className="settings-control" key={key}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={settings[key]}
        onChange={(event) =>
          setSettings((current) => ({ ...current, [key]: Number(event.target.value) }))
        }
      />
      <output>{settings[key]}</output>
    </label>
  );

  const expandImage = useCallback((image: GalleryImage, title: string) => {
    if (!suppressClickRef.current) {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsClosingExpanded(false);
      setExpanded({ image, title });
    }
  }, []);

  const showReveal = useCallback((image: GalleryImage, bounds: DOMRect) => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    setRevealImage((current) =>
      current?.image.src === image.src &&
      current.bounds.left === bounds.left &&
      current.bounds.top === bounds.top &&
      current.bounds.width === bounds.width &&
      current.bounds.height === bounds.height
        ? current
        : { image, bounds },
    );
  }, []);

  const hideReveal = useCallback(() => {
    if (revealTimeoutRef.current !== null) window.clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = window.setTimeout(() => {
      setRevealImage(null);
      revealTimeoutRef.current = null;
    }, 100);
  }, []);

  return (
    <main className="interactive-gallery">
      {revealImage && (
        <LiquidRevealCursor
          size={72}
          trail={0.8}
          smear={0.35}
          flow={0.55}
          speed={0.65}
          delay={0.12}
          splash={false}
          lens={false}
          grain={false}
          fixed
          zIndex={4}
        >
          <div className="liquid-image-reveal">
            <img
              src={revealImage.image.src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: revealImage.bounds.left,
                top: revealImage.bounds.top,
                width: revealImage.bounds.width,
                height: revealImage.bounds.height,
                objectFit: "cover",
              }}
            />
          </div>
        </LiquidRevealCursor>
      )}
      <div className="mac-window">
        <div className="mac-titlebar">
          <div className="mac-traffic-lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="mac-window-title">Interactive Design Gallery</span>
          <a className="mac-window-status mac-window-link" href="/desktop">
            FOLDER VIEW <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div
          ref={containerRef}
          className={`gallery-viewport${isDragging ? " is-dragging" : ""}${expanded ? " is-expanded" : ""}`}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={(event) =>
            zoomAt(
              event.clientX,
              event.clientY,
              targetTransformRef.current.scale < 1.5 ? 2 : 1,
            )
          }
          aria-label="Interactive design gallery. Drag to move and scroll to zoom."
        >
          <div className="gallery-backdrop" aria-hidden="true" />
          <div ref={canvasRef} className="gallery-canvas">
            {positions.map(({ col, row, card }, index) => (
              <GalleryTile
                key={`${col},${row}`}
                card={card}
                col={col}
                row={row}
                number={index + 1}
                itemGap={settings.itemGap}
                onExpand={expandImage}
                onReveal={showReveal}
                onHideReveal={hideReveal}
              />
            ))}
          </div>
          <div className="gallery-vignette" aria-hidden="true" />
        </div>

        <header className="gallery-heading">
          <p>Selected work · Graphic design</p>
          <span>Drag to explore</span>
        </header>

        <div className="gallery-hint">
          <span>DRAG TO MOVE</span>
          <span>SCROLL TO ZOOM</span>
          <span>DOUBLE-CLICK TO RESET</span>
        </div>

        <nav className="gallery-controls" aria-label="Gallery controls">
          <button
            type="button"
            aria-label="Zoom out"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => zoomAtCenter(targetTransformRef.current.scale / 1.2)}
          >
            −
          </button>
          <button
            type="button"
            className="zoom-readout"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={resetView}
            aria-label="Reset zoom"
          >
            {Math.round(transform.scale * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => zoomAtCenter(targetTransformRef.current.scale * 1.2)}
          >
            +
          </button>
        </nav>

        <button
          className="settings-toggle"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setSettingsOpen((open) => !open)}
          aria-expanded={settingsOpen}
        >
          Settings <span>{settingsOpen ? "−" : "+"}</span>
        </button>

        {settingsOpen && (
          <aside
            className="settings-panel"
            aria-label="Gallery settings"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="settings-panel-header">
              <h2>Gallery Settings</h2>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
                ×
              </button>
            </div>
            <section>
              <h3>Layout</h3>
              {settingSlider("itemGap", "Item gap", 0, 120, 5)}
              {settingSlider("bufferZone", "Buffer zone", 1, 5, 0.5)}
            </section>
            <section>
              <h3>Style</h3>
              {settingSlider("borderRadius", "Corner radius", 0, 30, 1)}
              {settingSlider("hoverScale", "Hover scale", 1, 1.5, 0.05)}
              {settingSlider("vignetteStrength", "Vignette strength", 0, 1, 0.05)}
              {settingSlider("vignetteSize", "Vignette size", 0, 500, 10)}
            </section>
            <section>
              <h3>Motion & zoom</h3>
              {settingSlider("expandedScale", "Expanded size", 0.2, 0.8, 0.05)}
              {settingSlider("dragEase", "Smooth flow", 0.01, 0.2, 0.01)}
              {settingSlider("momentumFactor", "Momentum", 50, 500, 10)}
              {settingSlider("zoomDuration", "Zoom duration", 0.2, 1.5, 0.1)}
              {settingSlider("overlayOpacity", "Overlay opacity", 0.2, 1, 0.05)}
              {settingSlider("overlayEaseDuration", "Overlay duration", 0.2, 1.5, 0.1)}
              <label className="settings-control">
                <span>Zoom level</span>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.05}
                  value={transform.scale}
                  onChange={(event) => zoomAtCenter(Number(event.target.value))}
                />
                <output>{transform.scale.toFixed(2)}</output>
              </label>
            </section>
            <button className="settings-reset" type="button" onClick={resetView}>
              Reset view
            </button>
          </aside>
        )}

        {expanded && (
          <div
            className={`expanded-overlay${isClosingExpanded ? " is-closing" : ""}`}
            style={{ backgroundColor: `rgba(0, 0, 0, ${settings.overlayOpacity})` }}
            onClick={closeExpanded}
          >
            <div
              className="expanded-content"
              style={{
                width: `min(92vw, 1200px, ${settings.expandedScale * 230}vw)`,
                height: `min(90vh, 1000px, ${settings.expandedScale * 225}vh)`,
                animationDuration: `${settings.zoomDuration}s`,
              }}
              role="dialog"
              aria-modal="true"
              aria-label={expanded.title}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="expanded-heading">
                <p className={`expanded-title${isClosingExpanded ? " is-closing" : ""}`}>
                  {expanded.title.split(/\s+/).map((word, index) => (
                    <span
                      className="expanded-title-word"
                      key={`${word}-${index}`}
                      style={{ animationDelay: `${isClosingExpanded ? index * 0.04 : 0.25 + index * 0.08}s` }}
                    >
                      {word}
                    </span>
                  ))}
                </p>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={closeExpanded}
                  aria-label="Close image"
                >
                  Close <span>×</span>
                </button>
              </div>
              <img className="expanded-image" src={expanded.image.src} alt={expanded.image.alt} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
