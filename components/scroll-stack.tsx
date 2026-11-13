"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemStackDistance?: number;
  stackPosition?: number | string;
  itemScale?: number;
  baseScale?: number;
  dimAmount?: number;
  blurAmount?: number;
  tiltAmount?: number;
  rotationAmount?: number;
  holdDistance?: number;
  smoothScroll?: boolean;
  snap?: boolean;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
};

type ScrollStackItemProps = {
  children: ReactNode;
  itemClassName?: string;
  style?: CSSProperties;
};

type StackSettings = Omit<ScrollStackProps, "children" | "className">;

function resolveOffset(value: number | string, size: number) {
  if (typeof value === "number") return value;
  const text = value.trim();
  if (text.endsWith("%")) return (Number.parseFloat(text) / 100) * size;
  return Number.parseFloat(text) || 0;
}

function toLength(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

function scrollsInside(node: EventTarget | null, stop: HTMLElement, delta: number) {
  let element = node instanceof Element ? node : null;
  while (element && element !== stop) {
    if (element.scrollHeight > element.clientHeight + 1) {
      const overflow = window.getComputedStyle(element).overflowY;
      if (
        (overflow === "auto" || overflow === "scroll") &&
        (delta > 0
          ? element.scrollTop + element.clientHeight < element.scrollHeight - 1
          : element.scrollTop > 0)
      ) {
        return true;
      }
    }
    element = element.parentElement;
  }
  return false;
}

export function ScrollStackItem({
  children,
  itemClassName = "",
  style,
}: ScrollStackItemProps) {
  return (
    <div className={`scroll-stack-card ${itemClassName}`.trim()} style={style}>
      {children}
      <span className="scroll-stack-card__shade" aria-hidden="true" />
    </div>
  );
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemStackDistance = 24,
  stackPosition = "15%",
  itemScale = 0.05,
  baseScale = 0.8,
  dimAmount = 0.2,
  blurAmount = 0,
  tiltAmount = 0,
  rotationAmount = 0,
  holdDistance = 200,
  smoothScroll = true,
  snap = false,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<(() => void) | null>(null);
  const settingsRef = useRef<StackSettings | null>(null);
  const items = Children.toArray(children);

  useLayoutEffect(() => {
    settingsRef.current = {
      itemDistance,
      itemStackDistance,
      stackPosition,
      itemScale,
      baseScale,
      dimAmount,
      blurAmount,
      tiltAmount,
      rotationAmount,
      holdDistance,
      smoothScroll,
      snap,
      useWindowScroll,
      onStackComplete,
    };
    scheduleRef.current?.();
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    const end = endRef.current;
    if (!root || !inner || !end) return;

    const windowed = useWindowScroll;
    const target = windowed ? window : root;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cache = new Map<string, number | string>();
    let frame = 0;
    let glide = 0;
    let rest = 0;
    let complete = false;
    let gliding = false;
    let pressed = false;
    let current = 0;
    let goal = 0;
    let written = 0;
    let last = 0;
    let points: number[] = [];
    let reach = 0;

    const readScroll = () => (windowed ? window.scrollY : root.scrollTop);
    const maxScroll = () =>
      Math.max(
        0,
        windowed
          ? document.documentElement.scrollHeight - window.innerHeight
          : root.scrollHeight - root.clientHeight,
      );
    const writeScroll = (value: number) => {
      written = value;
      if (windowed) {
        window.scrollTo({ top: value, behavior: "auto" });
      } else {
        root.scrollTo({ top: value, behavior: "auto" });
      }
    };

    const write = <Value extends number | string>(
      key: string,
      value: Value,
      apply: (next: Value) => void,
    ) => {
      if (cache.get(key) === value) return false;
      cache.set(key, value);
      apply(value);
      return true;
    };

    const update = () => {
      frame = 0;
      const settings = settingsRef.current;
      const slots = Array.from(inner.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.hasAttribute("data-stack-slot"),
      );
      if (!settings || !slots.length) return;

      const viewHeight = windowed ? window.innerHeight : root.clientHeight;
      const viewTop = windowed ? 0 : root.getBoundingClientRect().top + root.clientTop;
      const stackTop = resolveOffset(settings.stackPosition ?? "15%", viewHeight);
      const offset = settings.itemStackDistance ?? 24;
      const heights = slots.map((slot) => slot.offsetHeight);
      const tops = slots.map((slot) => slot.getBoundingClientRect().top);
      const lastPin = stackTop + (slots.length - 1) * offset;
      const padTop = windowed ? 0 : stackTop;
      const endHeight =
        (settings.holdDistance ?? 200) +
        (windowed
          ? 0
          : Math.max(0, viewHeight - lastPin - heights[heights.length - 1]));

      let moved = write("padTop", padTop, (value) => {
        inner.style.paddingTop = `${value}px`;
      });
      moved =
        write("endHeight", endHeight, (value) => {
          end.style.height = `${value}px`;
        }) || moved;

      let flow = inner.getBoundingClientRect().top - viewTop + readScroll() + padTop;
      points = heights.map((height, index) => {
        const point = flow - stackTop - index * offset;
        flow += height + (settings.itemDistance ?? 100);
        return point;
      });
      reach = Math.max(
        40,
        (heights[0] + (settings.itemDistance ?? 100) - offset) / 2,
      );

      const depths = slots.map(() => 0);
      let lastCover = 0;
      for (let index = 1; index < slots.length; index += 1) {
        const pinBefore = viewTop + stackTop + (index - 1) * offset;
        const start = pinBefore + heights[index - 1];
        const span = Math.max(1, start - pinBefore - offset);
        const cover = Math.min(1, Math.max(0, (start - tops[index]) / span));
        for (let depthIndex = 0; depthIndex < index; depthIndex += 1) {
          depths[depthIndex] += cover;
        }
        lastCover = cover;
      }

      const dimStep = Math.min(Math.max(settings.dimAmount ?? 0.2, 0), 1);
      slots.forEach((slot, index) => {
        const card = slot.firstElementChild;
        if (!(card instanceof HTMLElement)) return;
        const depth = depths[index];
        const lean = Math.min(depth, 1);
        const scale = Math.max(
          Math.min(settings.baseScale ?? 0.8, 1),
          1 - depth * (settings.itemScale ?? 0.05),
        );
        const tilt = -lean * (settings.tiltAmount ?? 0);
        const turn =
          lean *
          (settings.rotationAmount ?? 0) *
          (index % 2 ? -1 : 1);
        const blur = depth * (settings.blurAmount ?? 0);
        const dim = 1 - Math.pow(1 - dimStep, depth);
        const transform =
          depth < 0.0005
            ? ""
            : `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

        write(`transform${index}`, transform, (value) => {
          card.style.transform = value;
        });
        write(`filter${index}`, blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "", (value) => {
          card.style.filter = value;
        });
        write(`dim${index}`, dim.toFixed(3), (value) => {
          card.style.setProperty("--scroll-stack-dim", value);
        });
      });

      const done = slots.length > 1 && lastCover >= 0.999;
      if (done !== complete) {
        complete = done;
        if (done) settings.onStackComplete?.();
      }

      if (moved) schedule();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const step = (now: number) => {
      const deltaTime = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (Math.abs(readScroll() - written) > 2) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      current += (goal - current) * (1 - Math.pow(0.9, deltaTime * 60));
      if (Math.abs(goal - current) < 0.5) current = goal;
      writeScroll(current);
      if (current === goal) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      glide = requestAnimationFrame(step);
    };

    const glideTo = (value: number) => {
      goal = Math.min(Math.max(value, 0), maxScroll());
      if (motion.matches) {
        writeScroll(goal);
        return;
      }
      if (gliding) return;
      gliding = true;
      current = readScroll();
      written = current;
      last = performance.now();
      glide = requestAnimationFrame(step);
    };

    const settle = () => {
      rest = 0;
      if (!settingsRef.current?.snap || gliding || pressed || !points.length) return;
      const now = readScroll();
      const nearest = points.reduce((best, point) =>
        Math.abs(point - now) < Math.abs(best - now) ? point : best,
      );
      const gap = Math.abs(nearest - now);
      if (gap > 1 && gap < reach) glideTo(nearest);
    };

    const settleSoon = () => {
      window.clearTimeout(rest);
      rest = window.setTimeout(settle, 140);
    };

    const onScroll = () => {
      schedule();
      if (!gliding) settleSoon();
    };

    const onWheel = (event: Event) => {
      if (!(event instanceof WheelEvent)) return;
      if (
        !settingsRef.current?.smoothScroll ||
        motion.matches ||
        event.defaultPrevented ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }
      const page = windowed ? window.innerHeight : root.clientHeight;
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page : 1);
      if (
        !delta ||
        scrollsInside(event.target, windowed ? document.body : root, delta)
      ) {
        return;
      }
      const base = gliding ? goal : readScroll();
      if (
        (delta < 0 && base <= 0) ||
        (delta > 0 && base >= maxScroll() - 0.5)
      ) {
        return;
      }
      event.preventDefault();
      window.clearTimeout(rest);
      glideTo(base + delta);
    };

    const onPress = () => {
      pressed = true;
      window.clearTimeout(rest);
    };

    const onRelease = () => {
      if (!pressed) return;
      pressed = false;
      settleSoon();
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(inner);
    target.addEventListener("scroll", onScroll, { passive: true });
    target.addEventListener("wheel", onWheel, { passive: false });
    target.addEventListener("pointerdown", onPress, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    window.addEventListener("resize", schedule);
    scheduleRef.current = schedule;
    update();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(glide);
      window.clearTimeout(rest);
      observer.disconnect();
      target.removeEventListener("scroll", onScroll);
      target.removeEventListener("wheel", onWheel);
      target.removeEventListener("pointerdown", onPress);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("resize", schedule);
      scheduleRef.current = null;
    };
  }, [useWindowScroll]);

  return (
    <div
      ref={rootRef}
      className={`scroll-stack scroll-stack--${useWindowScroll ? "window" : "contained"} ${className}`.trim()}
    >
      <div ref={innerRef} className="scroll-stack__inner">
        {items.map((child, index) => {
          const gap = itemDistance - (items.length - index) * itemStackDistance;
          return (
            <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
              {index > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    height: Math.max(0, gap),
                    marginTop: Math.min(0, gap),
                  }}
                />
              )}
              <div
                data-stack-slot=""
                className="scroll-stack__slot"
                style={{
                  top: `calc(${toLength(stackPosition)} + ${index * itemStackDistance}px)`,
                  marginBottom: (items.length - 1 - index) * itemStackDistance,
                  zIndex: index + 1,
                }}
              >
                {child}
              </div>
            </Fragment>
          );
        })}
        <div ref={endRef} className="scroll-stack__end" aria-hidden="true" />
      </div>
    </div>
  );
}
