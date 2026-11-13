"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import "./spotlight-card.css";

// React Bits Spotlight Card treatment, adapted to the gallery's visual theme.
// Reference: https://reactbits.dev/components/spotlight-card
type SpotlightCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  spotlightColor?: string;
  spotlightSize?: number;
  intensity?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "#c1f184",
  spotlightSize = 240,
  intensity = 0.16,
  ...props
}: SpotlightCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const light = lightRef.current;
    const edge = edgeRef.current;
    if (!root || !light || !edge) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer = { x: 0, y: 0, active: false };
    const position = { x: 0, y: 0, opacity: 0 };
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const targetX = pointer.x - rect.left;
      const targetY = pointer.y - rect.top;
      const targetOpacity = pointer.active && !reduceMotion ? 1 : 0;
      const delta = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const easing = reduceMotion ? 1 : 1 - Math.exp(-delta / 0.055);

      position.x += (targetX - position.x) * easing;
      position.y += (targetY - position.y) * easing;
      position.opacity += (targetOpacity - position.opacity) * easing;

      const x = `${position.x.toFixed(1)}px`;
      const y = `${position.y.toFixed(1)}px`;
      light.style.background = `radial-gradient(circle ${spotlightSize}px at ${x} ${y}, color-mix(in srgb, ${spotlightColor} 32%, transparent), transparent 72%)`;
      edge.style.background = `radial-gradient(circle ${Math.max(80, spotlightSize * 0.55)}px at ${x} ${y}, color-mix(in srgb, ${spotlightColor} 72%, transparent), transparent 72%)`;
      light.style.opacity = String(position.opacity * clamp(intensity, 0, 1));
      edge.style.opacity = String(position.opacity * 0.45);

      const settled =
        Math.abs(targetX - position.x) < 0.1 &&
        Math.abs(targetY - position.y) < 0.1 &&
        Math.abs(targetOpacity - position.opacity) < 0.002;
      if (!settled) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      wake();
    };
    const onPointerLeave = () => {
      pointer.active = false;
      wake();
    };
    const onScroll = () => {
      if (pointer.active || position.opacity > 0) wake();
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    wake();

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [intensity, spotlightColor, spotlightSize]);

  return (
    <div
      ref={rootRef}
      className={`spotlight-card${className ? ` ${className}` : ""}`}
      {...props}
    >
      <span ref={lightRef} className="spotlight-card__light" aria-hidden="true" />
      {children}
      <span ref={edgeRef} className="spotlight-card__edge" aria-hidden="true" />
    </div>
  );
}
