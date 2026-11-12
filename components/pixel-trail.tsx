"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./pixel-trail.css";

type TrailPoint = {
  x: number;
  y: number;
  age: number;
  force: number;
  vx: number;
  vy: number;
};

type PixelTrailProps = {
  gridSize?: number;
  trailSize?: number;
  maxAge?: number;
  interpolate?: number;
  easingFunction?: (value: number) => number;
  color?: string;
  trailColor?: string;
  gooeyFilter?: { strength: number } | false;
  shape?: "square" | "circle" | "diamond";
  gap?: number;
  decay?: "fade" | "shrink" | "dither";
  flow?: number;
  gravity?: number;
  sparkle?: number;
  shine?: number;
  glow?: number;
  clickBurst?: boolean;
  imageSrc?: string;
  dpr?: number;
  className?: string;
  style?: CSSProperties;
};

type TrailSettings = Required<Omit<PixelTrailProps, "imageSrc" | "className" | "style">>;

let colorContext: CanvasRenderingContext2D | null = null;

function parseColor(value: string): [number, number, number] {
  if (typeof document === "undefined") return [1, 1, 1];
  if (!colorContext) {
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = 1;
    colorCanvas.height = 1;
    colorContext = colorCanvas.getContext("2d", { willReadFrequently: true });
  }
  if (!colorContext) return [1, 1, 1];
  colorContext.clearRect(0, 0, 1, 1);
  colorContext.fillStyle = value;
  colorContext.fillRect(0, 0, 1, 1);
  const [red, green, blue] = colorContext.getImageData(0, 0, 1, 1).data;
  return [red / 255, green / 255, blue / 255];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return amount * amount * (3 - 2 * amount);
};

export default function PixelTrail({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = (value) => value,
  color = "#ffffff",
  trailColor,
  gooeyFilter = { strength: 2 },
  shape = "square",
  gap = 0.08,
  decay = "fade",
  flow = 0,
  gravity = 0,
  sparkle = 0,
  shine = 0.6,
  glow = 0.4,
  clickBurst = false,
  imageSrc,
  dpr,
  className = "",
  style,
}: PixelTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imagePixelsRef = useRef<ImageData | null>(null);
  const settingsRef = useRef<TrailSettings | null>(null);
  const engineRef = useRef<{ wake: () => void; redraw: () => void } | null>(null);

  settingsRef.current = {
    gridSize: Math.max(1, gridSize),
    trailSize: Math.max(0, trailSize),
    maxAge: Math.max(1, maxAge),
    interpolate: Math.max(0, interpolate),
    easingFunction: easingFunction ?? ((value) => value),
    color,
    trailColor: trailColor ?? color,
    gooeyFilter: gooeyFilter === false ? false : { strength: Math.max(0, gooeyFilter?.strength ?? 2) },
    shape,
    gap: clamp(gap, 0, 0.9),
    decay,
    flow: clamp(flow, 0, 1),
    gravity: clamp(gravity, -1, 1),
    sparkle: clamp(sparkle, 0, 1),
    shine: clamp(shine, 0, 1),
    glow: clamp(glow, 0, 1),
    clickBurst,
    dpr: dpr ?? (typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2)),
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!container || !canvas || !context) return;

    const state = {
      width: 1,
      height: 1,
      ratio: 1,
      frame: 0,
      last: 0,
      points: [] as TrailPoint[],
      pointer: { x: 0, y: 0, vx: 0, vy: 0, at: 0, inside: false },
    };

    const updateImagePixels = () => {
      const image = imageRef.current;
      if (!image?.complete || !image.naturalWidth) {
        imagePixelsRef.current = null;
        return;
      }
      const cells = Math.max(1, Math.round(settingsRef.current?.gridSize ?? 40));
      const sample = document.createElement("canvas");
      sample.width = cells;
      sample.height = cells;
      const sampleContext = sample.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) return;
      const scale = Math.max(cells / image.naturalWidth, cells / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      sampleContext.drawImage(image, (cells - width) / 2, (cells - height) / 2, width, height);
      imagePixelsRef.current = sampleContext.getImageData(0, 0, cells, cells);
    };

    const resize = () => {
      const settings = settingsRef.current;
      if (!settings) return;
      const bounds = container.getBoundingClientRect();
      state.width = Math.max(1, bounds.width);
      state.height = Math.max(1, bounds.height);
      state.ratio = settings.dpr;
      const pixelWidth = Math.max(1, Math.floor(state.width * state.ratio));
      const pixelHeight = Math.max(1, Math.floor(state.height * state.ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      updateImagePixels();
    };

    const draw = (delta: number) => {
      const settings = settingsRef.current;
      if (!settings) return;
      const { width, height, ratio, points } = state;
      const side = Math.max(width, height);
      const cell = side / settings.gridSize;
      const columns = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const base = parseColor(settings.color);
      const aged = parseColor(settings.trailColor);
      const pixels = imagePixelsRef.current;
      const imageSize = Math.max(1, Math.round(settings.gridSize));

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      for (let pointIndex = points.length - 1; pointIndex >= 0; pointIndex--) {
        const point = points[pointIndex];
        point.age += delta * 1000;
        if (point.age >= settings.maxAge) {
          points.splice(pointIndex, 1);
          continue;
        }
        if (settings.flow > 0 || settings.gravity !== 0) {
          const drag = Math.exp(-3 * delta);
          point.vx *= drag;
          point.vy = point.vy * drag - settings.gravity * 0.18 * delta;
          point.x += point.vx * delta;
          point.y += point.vy * delta;
        }

        const age = clamp(point.age / settings.maxAge, 0, 1);
        const swell = age < 0.3 ? settings.easingFunction(age / 0.3) : settings.easingFunction(1 - (age - 0.3) / 0.7);
        const intensity = clamp(swell * point.force, 0, 1);
        let radius = Math.max(cell * 0.5, settings.trailSize * side * intensity);
        if (settings.decay === "shrink") radius *= Math.sqrt(intensity);
        const centerX = point.x * width;
        const centerY = (1 - point.y) * height;
        const reach = Math.min(settings.gridSize, Math.ceil(radius / cell) + 1);
        const centerColumn = Math.floor(centerX / cell);
        const centerRow = Math.floor(centerY / cell);

        for (let row = centerRow - reach; row <= centerRow + reach; row++) {
          if (row < 0 || row >= rows) continue;
          for (let column = centerColumn - reach; column <= centerColumn + reach; column++) {
            if (column < 0 || column >= columns) continue;
            const x = column * cell + cell / 2;
            const y = row * cell + cell / 2;
            const distance = Math.hypot(x - centerX, y - centerY);
            if (distance > radius + cell * 0.72) continue;
            let alpha = settings.gooeyFilter
              ? 1 - smoothstep(radius * 0.7, radius + cell * 0.72, distance)
              : distance < radius * 0.82 ? 1 : 0;
            if (settings.decay === "fade") alpha *= intensity;
            if (settings.decay === "dither" && alpha < 0.2 + ((column * 13 + row * 7) % 16) / 20) continue;
            if (settings.sparkle > 0 && Math.random() < settings.sparkle * age * 0.12) continue;
            if (alpha <= 0.01) continue;

            const blend = age;
            const imageOffset = (Math.min(imageSize - 1, Math.floor(row * imageSize / rows)) * imageSize + Math.min(imageSize - 1, Math.floor(column * imageSize / columns))) * 4;
            const imageData = pixels?.data;
            const rgb = imageData
              ? [imageData[imageOffset] / 255, imageData[imageOffset + 1] / 255, imageData[imageOffset + 2] / 255]
              : base.map((channel, index) => channel * (1 - blend) + aged[index] * blend);
            const flicker = settings.sparkle > 0 && Math.random() < settings.sparkle * 0.04 ? 1 : 0;
            const light = settings.shine * (0.12 + (1 - Math.min(1, distance / Math.max(radius, 1))) * 0.22 + flicker * 0.35);
            const red = Math.round((rgb[0] + (1 - rgb[0]) * light) * 255);
            const green = Math.round((rgb[1] + (1 - rgb[1]) * light) * 255);
            const blue = Math.round((rgb[2] + (1 - rgb[2]) * light) * 255);
            const inset = cell * settings.gap * 0.5;
            const left = column * cell + inset;
            const top = row * cell + inset;
            const size = cell - inset * 2;
            context.globalAlpha = alpha;
            context.fillStyle = `rgb(${red} ${green} ${blue})`;
            context.shadowColor = `rgb(${red} ${green} ${blue})`;
            context.shadowBlur = settings.glow * cell * 1.5;
            if (settings.shape === "circle") {
              context.beginPath();
              context.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI * 2);
              context.fill();
            } else if (settings.shape === "diamond") {
              context.beginPath();
              context.moveTo(left + size / 2, top);
              context.lineTo(left + size, top + size / 2);
              context.lineTo(left + size / 2, top + size);
              context.lineTo(left, top + size / 2);
              context.closePath();
              context.fill();
            } else {
              context.fillRect(left, top, size, size);
            }
          }
        }
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
    };

    const animate = (now: number) => {
      state.frame = 0;
      const delta = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;
      state.last = now;
      draw(delta);
      if (state.points.length) state.frame = requestAnimationFrame(animate);
      else state.last = 0;
    };

    const wake = () => {
      if (!state.frame) state.frame = requestAnimationFrame(animate);
    };

    const addPoint = (x: number, y: number, vx: number, vy: number, force = 1) => {
      state.points.push({ x, y, age: 0, force, vx, vy });
      if (state.points.length > 500) state.points.splice(0, state.points.length - 500);
    };

    const onMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / Math.max(1, bounds.width);
      const y = 1 - (event.clientY - bounds.top) / Math.max(1, bounds.height);
      const inside = x >= 0 && y >= 0 && x <= 1 && y <= 1;
      const pointer = state.pointer;
      const now = performance.now();
      if (inside) {
        if (pointer.inside) {
          const elapsed = Math.max(0.008, (now - pointer.at) / 1000);
          pointer.vx += ((x - pointer.x) / elapsed - pointer.vx) * 0.5;
          pointer.vy += ((y - pointer.y) / elapsed - pointer.vy) * 0.5;
          const distance = Math.hypot((x - pointer.x) * state.width, (y - pointer.y) * state.height);
          const steps = Math.min(80, Math.ceil(distance / Math.max(1, (Math.max(state.width, state.height) / (settingsRef.current?.gridSize ?? 40)) / 2)) * Math.max(1, settingsRef.current?.interpolate ?? 1));
          for (let step = 1; step < steps; step++) {
            addPoint(pointer.x + (x - pointer.x) * step / steps, pointer.y + (y - pointer.y) * step / steps, pointer.vx, pointer.vy, 0.75);
          }
        } else {
          pointer.vx = 0;
          pointer.vy = 0;
        }
        addPoint(x, y, pointer.vx * (settingsRef.current?.flow ?? 0) * 0.3, pointer.vy * (settingsRef.current?.flow ?? 0) * 0.3);
        wake();
      }
      pointer.x = x;
      pointer.y = y;
      pointer.at = now;
      pointer.inside = inside;
    };

    const onDown = (event: PointerEvent) => {
      if (!settingsRef.current?.clickBurst) return;
      const bounds = container.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / Math.max(1, bounds.width);
      const y = 1 - (event.clientY - bounds.top) / Math.max(1, bounds.height);
      if (x < 0 || y < 0 || x > 1 || y > 1) return;
      for (let index = 0; index < 14; index++) {
        const angle = index / 14 * Math.PI * 2 + Math.random() * 0.3;
        const speed = 0.35 + Math.random() * 0.25;
        addPoint(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
      wake();
    };

    const onLeave = () => { state.pointer.inside = false; };
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    resizeObserver.observe(container);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("blur", onLeave);
    document.documentElement.addEventListener("pointerleave", onLeave);
    engineRef.current = { wake, redraw: () => { resize(); draw(0); } };
    resize();
    draw(0);

    return () => {
      cancelAnimationFrame(state.frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!imageSrc) {
      imageRef.current = null;
      imagePixelsRef.current = null;
      engineRef.current?.redraw();
      return;
    }
    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!active) return;
      imageRef.current = image;
      engineRef.current?.redraw();
    };
    image.onerror = () => {
      if (!active) return;
      imageRef.current = null;
      imagePixelsRef.current = null;
    };
    image.src = imageSrc;
    return () => { active = false; };
  }, [imageSrc]);

  useEffect(() => {
    engineRef.current?.redraw();
  });

  return (
    <div
      ref={containerRef}
      className={`pixel-canvas ${className}`.trim()}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", ...style }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}