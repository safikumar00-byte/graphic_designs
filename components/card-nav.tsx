"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import "./card-nav.css";

type NavLink = {
  label: string;
  href?: string;
  ariaLabel?: string;
};

type NavItem = {
  label: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  links: NavLink[];
};

type CardNavProps = {
  items: NavItem[];
  logo?: string | ReactNode;
  logoAlt?: string;
  logoHref?: string;
  cta?: { label: string; href?: string; onClick?: (event: MouseEvent<HTMLElement>) => void };
  theme?: "dark" | "light";
  surface?: "glass" | "solid";
  openOn?: "click" | "hover";
  cardEffect?: "rise" | "unfold" | "fade";
  stagger?: number;
  bounce?: number;
  speed?: number;
  cardHeight?: number;
  maxWidth?: number;
  accentColor?: string;
  menuLabel?: boolean;
  intro?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  linkComponent?: ElementType;
  onLinkClick?: (link: NavLink, item: NavItem, event: MouseEvent<HTMLElement>) => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

const themes = {
  dark: {
    "--cn-panel": "rgba(31, 31, 31, 0.88)",
    "--cn-solid": "#1f1f1f",
    "--cn-edge": "rgba(255, 255, 255, 0.1)",
    "--cn-highlight": "rgba(255, 255, 255, 0.07)",
    "--cn-shadow": "0 24px 48px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)",
    "--cn-text": "#f4f4f4",
    "--cn-muted": "rgba(244, 244, 244, 0.58)",
    "--cn-hover": "rgba(255, 255, 255, 0.06)",
    "--cn-ring": "rgba(244, 244, 244, 0.65)",
    "--cn-tile": "linear-gradient(180deg, #303030 0%, #232323 100%)",
    "--cn-tile-rim": "inset 0 0 0 1px rgba(255,255,255,.07), inset 0 1px 0 rgba(255,255,255,.1), 0 4px 10px -4px rgba(0,0,0,.6)",
    "--cn-cta": "#f4f4f4",
    "--cn-cta-ink": "#111111",
    "--cn-cta-shadow": "inset 0 1px 0 rgba(255,255,255,.8), 0 6px 16px -6px rgba(0,0,0,.6)",
    "--cn-cta-hover": "brightness(.92)",
  },
  light: {
    "--cn-panel": "rgba(244, 244, 246, 0.9)",
    "--cn-solid": "#f4f4f6",
    "--cn-edge": "rgba(24, 24, 27, 0.08)",
    "--cn-highlight": "rgba(255, 255, 255, 0.9)",
    "--cn-shadow": "0 24px 48px -24px rgba(24,24,27,.3), 0 6px 16px -10px rgba(24,24,27,.16)",
    "--cn-text": "#18181b",
    "--cn-muted": "rgba(24, 24, 27, 0.58)",
    "--cn-hover": "rgba(24, 24, 27, 0.05)",
    "--cn-ring": "rgba(24, 24, 27, 0.5)",
    "--cn-tile": "linear-gradient(180deg, #ffffff 0%, #f8f8fa 100%)",
    "--cn-tile-rim": "inset 0 0 0 1px rgba(24,24,27,.07), inset 0 1px 0 #fff, 0 4px 10px -5px rgba(24,24,27,.22)",
    "--cn-cta": "#18181b",
    "--cn-cta-ink": "#ffffff",
    "--cn-cta-shadow": "inset 0 1px 0 rgba(255,255,255,.12), 0 6px 14px -6px rgba(24,24,27,.45)",
    "--cn-cta-hover": "brightness(1.25)",
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;

export default function CardNav({
  items,
  logo,
  logoAlt = "Logo",
  logoHref = "/",
  cta,
  theme = "dark",
  surface = "glass",
  openOn = "click",
  cardEffect = "rise",
  stagger = 0.12,
  bounce = 0.2,
  speed = 1,
  cardHeight = 176,
  maxWidth = 800,
  accentColor,
  menuLabel = true,
  intro = true,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  linkComponent: LinkComponent = Link,
  onLinkClick,
  ariaLabel = "Main",
  className = "",
  style,
}: CardNavProps) {
  const contentId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const settingsRef = useRef({ open: defaultOpen, cardEffect, stagger, bounce, speed });
  const leaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introRef = useRef(intro);
  const [openState, setOpenState] = useState(defaultOpen);
  const [narrow, setNarrow] = useState(false);
  const [shown, setShown] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openState;
  const hasCta = Boolean(cta);

  settingsRef.current = { open, cardEffect, stagger: clamp(stagger, 0, 0.3), bounce: clamp(bounce, 0, 1), speed: clamp(speed, 0.2, 3) };

  const setOpen = (next: boolean) => {
    if (next === open) return;
    if (!controlled) setOpenState(next);
    onOpenChange?.(next);
  };

  const palette = themes[theme];
  const vars: CSSProperties & Record<string, string> = {
    ...palette,
    "--cn-max": `${maxWidth}px`,
    "--cn-bar": "60px",
    "--cn-inset": "8px",
    "--cn-gap": "8px",
    "--cn-radius": "18px",
    "--cn-logo": "24px",
    "--cn-card": `${cardHeight}px`,
  };
  if (surface === "glass") vars["--cn-blur"] = "blur(20px) saturate(1.5)";
  if (surface === "solid") {
    vars["--cn-panel"] = palette["--cn-solid"];
    vars["--cn-blur"] = "none";
  }
  if (accentColor) {
    vars["--cn-cta"] = accentColor;
    vars["--cn-cta-ink"] = "#111111";
    vars["--cn-cta-hover"] = "brightness(1.08)";
  }

  useEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { progress: settingsRef.current.open ? 1 : 0, velocity: 0, height: content.offsetHeight };
    let frame = 0;
    let last = 0;

    const render = () => {
      const current = settingsRef.current;
      const barHeight = parseFloat(getComputedStyle(panel).getPropertyValue("--cn-bar")) || 60;
      panel.style.height = `${barHeight + Math.max(0, state.progress) * state.height}px`;
      const cards = cardRefs.current.filter((card): card is HTMLDivElement => Boolean(card));
      const lag = cards.length > 1 ? Math.min(current.stagger, 0.7 / (cards.length - 1)) : 0;
      const span = 1 - lag * (cards.length - 1);
      cards.forEach((card, index) => {
        const progress = clamp((state.progress - index * lag) / Math.max(span, 0.05), 0, 1);
        const eased = easeOut(progress);
        if (current.cardEffect === "unfold") {
          card.style.transform = `translateY(${(1 - eased) * -10}px) rotateX(${(1 - eased) * -72}deg)`;
          card.style.opacity = `${clamp(progress * 1.8, 0, 1)}`;
          card.style.filter = "";
        } else if (current.cardEffect === "fade") {
          card.style.transform = `translateY(${(1 - eased) * 6}px)`;
          card.style.opacity = `${eased}`;
          card.style.filter = eased < 0.999 ? `blur(${(1 - eased) * 6}px)` : "";
        } else {
          card.style.transform = `translateY(${(1 - eased) * 26}px) scale(${0.97 + 0.03 * eased})`;
          card.style.opacity = `${eased}`;
          card.style.filter = "";
        }
      });
    };

    const tick = (now: number) => {
      frame = 0;
      const current = settingsRef.current;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const target = current.open ? 1 : 0;
      if (reduceMotion) {
        state.progress = target;
        state.velocity = 0;
      } else {
        const spring = 160 * current.speed * current.speed;
        const damping = current.open ? 1 - 0.68 * current.bounce : 1;
        const steps = Math.ceil(delta / (1 / 240));
        const step = delta / steps;
        for (let index = 0; index < steps; index++) {
          state.velocity += (-spring * (state.progress - target) - 2 * damping * Math.sqrt(spring) * state.velocity) * step;
          state.progress += state.velocity * step;
        }
      }
      const done = Math.abs(state.progress - target) < 0.0005 && Math.abs(state.velocity) < 0.002;
      if (done) {
        state.progress = target;
        state.velocity = 0;
      }
      render();
      if (done && target === 0) setShown(false);
      if (!done) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    render();
    const observer = new ResizeObserver(() => {
      state.height = content.offsetHeight;
      render();
    });
    observer.observe(content);
    const refresh = () => {
      state.height = content.offsetHeight;
      render();
    };
    const root = rootRef.current;
    const measure = () => setNarrow(Boolean(root && root.offsetWidth < 560));
    measure();
    const rootObserver = root ? new ResizeObserver(measure) : null;
    if (root) rootObserver?.observe(root);
    (panel as HTMLElement & { cardNavWake?: () => void; cardNavRefresh?: () => void }).cardNavWake = wake;
    (panel as HTMLElement & { cardNavWake?: () => void; cardNavRefresh?: () => void }).cardNavRefresh = refresh;
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      rootObserver?.disconnect();
    };
  }, [items.length, hasCta, narrow]);

  useLayoutEffect(() => {
    const panel = panelRef.current as (HTMLElement & { cardNavWake?: () => void; cardNavRefresh?: () => void }) | null;
    if (open) setShown(true);
    panel?.cardNavRefresh?.();
    panel?.cardNavWake?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => {
    if (leaveRef.current) clearTimeout(leaveRef.current);
  }, []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const bar = panel?.querySelector<HTMLElement>(".card-nav__bar");
    if (!panel || !bar || !introRef.current) return;
    introRef.current = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    panel.animate(
      [
        { clipPath: `inset(0 ${Math.max(0, (width - height) / 2)}px round ${height / 2}px)`, opacity: 0 },
        { clipPath: "inset(0 0 round 18px)", opacity: 1 },
      ],
      { duration: 820, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
    );
    Array.from(bar.children).forEach((child, index) => {
      child.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 560, delay: 220 + index * 70, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
      );
    });
  }, []);

  const hover = openOn === "hover";
  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (!hover || event.pointerType === "touch") return;
    if (leaveRef.current) clearTimeout(leaveRef.current);
    setOpen(true);
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (!hover || event.pointerType === "touch") return;
    if (leaveRef.current) clearTimeout(leaveRef.current);
    leaveRef.current = setTimeout(() => setOpen(false), 160);
  };

  const renderTarget = (target: NavLink | NonNullable<CardNavProps["cta"]>, props: Record<string, unknown>, children: ReactNode) => {
    if (!target.href) return <button type="button" {...props}>{children}</button>;
    return <LinkComponent href={target.href} {...props}>{children}</LinkComponent>;
  };

  const renderCta = (wide: boolean) => {
    if (!cta) return null;
    return renderTarget(
      cta,
      {
        className: wide ? "card-nav__cta card-nav__cta--wide" : "card-nav__cta",
        tabIndex: wide && !open ? -1 : undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          cta.onClick?.(event);
          if (wide) setOpen(false);
        },
      },
      cta.label,
    );
  };

  return (
    <div
      ref={rootRef}
      className={["card-nav", className].filter(Boolean).join(" ")}
      data-open={open ? "" : undefined}
      data-shown={shown || open ? "" : undefined}
      data-narrow={narrow ? "" : undefined}
      style={{ ...vars, ...style }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <nav ref={panelRef} className="card-nav__panel" aria-label={ariaLabel}>
        <div className="card-nav__bar">
          <button
            ref={menuRef}
            type="button"
            className="card-nav__menu"
            data-icon-only={!menuLabel ? "" : undefined}
            aria-expanded={open}
            aria-controls={contentId}
            aria-label={!menuLabel ? (open ? "Close menu" : "Open menu") : undefined}
            onClick={() => setOpen(!open)}
          >
            <span className="card-nav__burger" aria-hidden="true">
              <span className="card-nav__line card-nav__line--top" />
              <span className="card-nav__line card-nav__line--bottom" />
            </span>
            {menuLabel && <span className="card-nav__menu-label">
              <span className="card-nav__word card-nav__word--open" aria-hidden={open}>Menu</span>
              <span className="card-nav__word card-nav__word--close" aria-hidden={!open}>Close</span>
            </span>}
          </button>
          {logo && <LinkComponent href={logoHref} className="card-nav__logo" aria-label={logoAlt}>
            {typeof logo === "string" ? <img src={logo} alt="" draggable={false} /> : logo}
          </LinkComponent>}
          {cta && !narrow && renderCta(false)}
        </div>
        <div ref={contentRef} id={contentId} className="card-nav__content" aria-hidden={!open}>
          <div className="card-nav__cards">
            {items.map((item, index) => <div
              key={`${item.label}-${index}`}
              ref={(element) => { cardRefs.current[index] = element; }}
              className="card-nav__card"
              data-tinted={item.bgColor ? "" : undefined}
              style={item.bgColor ? { background: item.bgColor, color: item.textColor } : undefined}
            >
              <div className="card-nav__card-head">
                <span className="card-nav__label">{item.label}</span>
                {item.description && <p className="card-nav__description">{item.description}</p>}
              </div>
              <ul className="card-nav__links">
                {item.links.map((link, linkIndex) => <li key={`${link.label}-${linkIndex}`}>
                  {renderTarget(link, {
                    className: "card-nav__link",
                    "aria-label": link.ariaLabel,
                    tabIndex: open ? undefined : -1,
                    onClick: (event: MouseEvent<HTMLElement>) => {
                      onLinkClick?.(link, item, event);
                      setOpen(false);
                    },
                  }, <>
                    <span className="card-nav__arrow" aria-hidden="true">
                      <HugeiconsIcon className="card-nav__arrow-icon card-nav__arrow-icon--out" icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
                      <HugeiconsIcon className="card-nav__arrow-icon card-nav__arrow-icon--in" icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
                    </span>
                    {link.label}
                  </>)}
                </li>)}
              </ul>
            </div>)}
          </div>
          {cta && narrow && <div ref={(element) => { cardRefs.current[items.length] = element; }}>{renderCta(true)}</div>}
        </div>
        <span className="card-nav__rim" />
      </nav>
    </div>
  );
}