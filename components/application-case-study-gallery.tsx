"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import {
  applicationCaseStudies,
  type ApplicationCaseStudy,
  type ApplicationScreen,
} from "@/lib/application-case-study-data";

function getScreenGroups(screens: ApplicationScreen[]) {
  const groups = new Map<string, ApplicationScreen[]>();
  for (const screen of screens) {
    const group = groups.get(screen.group) ?? [];
    group.push(screen);
    groups.set(screen.group, group);
  }
  return Array.from(groups, ([name, groupScreens]) => ({
    name,
    screens: groupScreens,
  }));
}

export default function ApplicationCaseStudyGallery({
  selectedProject,
}: {
  selectedProject: ApplicationCaseStudy;
}) {
  const groups = getScreenGroups(selectedProject.screens);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number | null>(
    null,
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const wasViewerOpenRef = useRef(false);

  const closeViewer = useCallback(() => setActiveScreenIndex(null), []);
  const showPrevious = useCallback(() => {
    setActiveScreenIndex((current) =>
      current === null
        ? null
        : (current - 1 + selectedProject.screens.length) %
          selectedProject.screens.length,
    );
  }, [selectedProject.screens.length]);
  const showNext = useCallback(() => {
    setActiveScreenIndex((current) =>
      current === null ? null : (current + 1) % selectedProject.screens.length,
    );
  }, [selectedProject.screens.length]);

  useEffect(() => {
    if (activeScreenIndex === null) {
      if (wasViewerOpenRef.current) openerRef.current?.focus();
      openerRef.current = null;
      wasViewerOpenRef.current = false;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!wasViewerOpenRef.current) {
      closeButtonRef.current?.focus();
      wasViewerOpenRef.current = true;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
      if (event.key === "Tab") {
        const first = closeButtonRef.current;
        const last = nextButtonRef.current;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeScreenIndex, closeViewer, showNext, showPrevious]);

  const activeScreen =
    activeScreenIndex === null
      ? null
      : selectedProject.screens[activeScreenIndex];

  return (
    <main className="selected-work application-case-study">
      <header className="selected-work__header">
        <p className="selected-work__eyebrow">Portfolio · Application screens</p>
        <h1>
          UI/UX case studies<span>.</span>
        </h1>
      </header>

      <div className="selected-work__layout">
        <nav className="selected-work__tabs" aria-label="Case study contents">
          <Link className="application-case-study__home" href="/">
            <span aria-hidden="true">←</span> Home
          </Link>
          <p className="selected-work__tabs-label">{selectedProject.name}</p>
          <p className="application-case-study__side-caption">
            {selectedProject.category}
          </p>
          <div className="application-case-study__flow-list">
            {groups.map((group, index) => (
              <a
                className="application-case-study__flow-link"
                href={`#${selectedProject.slug}-flow-${index + 1}`}
                key={group.name}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {group.name}
              </a>
            ))}
          </div>
        </nav>

        <div className="selected-work__panel">
          <div className="application-case-study__project-switcher">
            <span>UI/UX · {selectedProject.name}</span>
            <nav aria-label="Switch case study">
              {applicationCaseStudies.map((project, index) => (
                <Link
                  aria-current={
                    project.slug === selectedProject.slug ? "page" : undefined
                  }
                  href={`/case-study/${project.slug}`}
                  key={project.slug}
                >
                  {String(index + 1).padStart(2, "0")} {project.name}
                </Link>
              ))}
            </nav>
          </div>

          {groups.map((group, groupIndex) => (
            <section
              aria-labelledby={`${selectedProject.slug}-flow-title-${groupIndex + 1}`}
              className="application-case-study__flow"
              id={`${selectedProject.slug}-flow-${groupIndex + 1}`}
              key={group.name}
            >
              <div className="application-case-study__flow-heading">
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <h2 id={`${selectedProject.slug}-flow-title-${groupIndex + 1}`}>
                  {group.name}
                </h2>
                <span>{group.screens.length} screens</span>
              </div>
              <div className="application-case-study__screen-strip">
                {group.screens.map((screen) => {
                  const screenIndex = selectedProject.screens.indexOf(screen);

                  return (
                    <figure
                      className={`application-case-study__screen application-case-study__screen--${screen.device}`}
                      key={screen.src}
                      style={
                        {
                          "--screen-ratio": `${screen.width} / ${screen.height}`,
                        } as CSSProperties
                      }
                    >
                      <button
                        aria-label={`Open ${screen.label}`}
                        className="application-case-study__image-button"
                        onClick={(event) => {
                          openerRef.current = event.currentTarget;
                          setActiveScreenIndex(screenIndex);
                        }}
                        type="button"
                      >
                        <SpotlightCard
                          className="application-case-study__spotlight"
                          intensity={0.1}
                          spotlightColor="#84946f"
                          spotlightSize={300}
                        >
                          <Image
                            alt={screen.alt}
                            className="application-case-study__image"
                            decoding="async"
                            fill
                            sizes={
                              screen.device === "mobile"
                                ? "(max-width: 760px) 140px, 178px"
                                : "(max-width: 760px) 75vw, 360px"
                            }
                            src={screen.src}
                          />
                        </SpotlightCard>
                      </button>
                      <figcaption>{screen.label}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {activeScreen && activeScreenIndex !== null && (
        <div
          className="application-case-study__viewer"
          onClick={closeViewer}
          role="presentation"
        >
          <section
            aria-label={`${selectedProject.name} screen viewer`}
            aria-modal="true"
            className="application-case-study__viewer-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="application-case-study__viewer-toolbar">
              <p>{activeScreen.label}</p>
              <span>
                {String(activeScreenIndex + 1).padStart(2, "0")} /{" "}
                {String(selectedProject.screens.length).padStart(2, "0")}
              </span>
              <button
                aria-label="Close screen viewer"
                className="application-case-study__viewer-close"
                onClick={closeViewer}
                ref={closeButtonRef}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="application-case-study__viewer-stage">
              <button
                aria-label="Previous screen"
                className="application-case-study__viewer-nav"
                onClick={showPrevious}
                ref={previousButtonRef}
                type="button"
              >
                ←
              </button>
              <Image
                alt={activeScreen.alt}
                className="application-case-study__viewer-image"
                height={activeScreen.height}
                priority
                src={activeScreen.src}
                width={activeScreen.width}
              />
              <button
                aria-label="Next screen"
                className="application-case-study__viewer-nav"
                onClick={showNext}
                ref={nextButtonRef}
                type="button"
              >
                →
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
