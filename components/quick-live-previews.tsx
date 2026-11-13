"use client";

import { useRef, useState, type KeyboardEvent } from "react";

type ProjectScreen = {
  src: string;
  alt: string;
  label: string;
};

type SelectedProject = {
  id: string;
  name: string;
  category: string;
  year: string;
  description: string;
  prototypeEmbedUrl: string;
  websiteUrl: string;
  screens: ProjectScreen[];
};

const projects: SelectedProject[] = [
  {
    id: "tristone",
    name: "Tristone Creations",
    category: "Brand campaign · Social",
    year: "2026",
    description:
      "A brighter, more cohesive social identity built to make every campaign feel unmistakably Tristone.",
    prototypeEmbedUrl: "",
    websiteUrl: "",
    screens: Array.from({ length: 5 }, (_, index) => {
      const number = index + 1;
      return {
        src: `/tristoneCarouselBanners/webp/tristone_creations_${number}.webp`,
        alt: `Tristone Creations campaign artwork ${number}`,
        label: `Campaign frame ${String(number).padStart(2, "0")}`,
      };
    }),
  },
  {
    id: "student-care",
    name: "Student Care",
    category: "Education · Campaign system",
    year: "2026",
    description:
      "Clear, confident study-abroad campaigns that turn complex options into an inviting next step.",
    prototypeEmbedUrl: "",
    websiteUrl: "",
    screens: Array.from({ length: 6 }, (_, index) => {
      const number = index + 1;
      return {
        src: `/studentCare/webp/studnet_care_${number}.webp`,
        alt: `Student Care campaign artwork ${number}`,
        label: `Campaign frame ${String(number).padStart(2, "0")}`,
      };
    }),
  },
  {
    id: "travellers-bridge",
    name: "Travellers Bridge",
    category: "Travel · Destination campaign",
    year: "2026",
    description:
      "Destination-led visuals for a travel brand, pairing vivid places with a simple, bookable story.",
    prototypeEmbedUrl: "",
    websiteUrl: "",
    screens: Array.from({ length: 6 }, (_, index) => {
      const number = index + 1;
      return {
        src: `/travellersBridge/webp/travellers_bridge_${number}.webp`,
        alt: `Travellers Bridge destination artwork ${number}`,
        label: `Campaign frame ${String(number).padStart(2, "0")}`,
      };
    }),
  },
];

function getFigmaEmbedUrl(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      (url.hostname === "figma.com" || url.hostname.endsWith(".figma.com"))
    ) {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

function getWebsiteUrl(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function QuickLivePreviews() {
  const [selectedId, setSelectedId] = useState(projects[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedProject =
    projects.find((project) => project.id === selectedId) ?? projects[0];
  const prototypeUrl = getFigmaEmbedUrl(selectedProject.prototypeEmbedUrl);
  const websiteUrl = getWebsiteUrl(selectedProject.websiteUrl);

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % projects.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + projects.length) % projects.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = projects.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setSelectedId(projects[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="selected-work" aria-labelledby="selected-work-title">
      <header className="selected-work__header">
        <p className="selected-work__eyebrow">Portfolio · Case studies</p>
        <h2 id="selected-work-title">
          Selected work<span>.</span>
        </h2>
        <p className="selected-work__intro">
          A closer look at the thinking, screens, and visual details behind
          each project.
        </p>
      </header>

      <div className="selected-work__layout">
        <nav className="selected-work__tabs" aria-label="Selected projects">
          <p className="selected-work__tabs-label">Projects</p>
          <div role="tablist" aria-orientation="vertical">
            {projects.map((project, index) => (
              <button
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`selected-work-tab-${project.id}`}
                key={project.id}
                className="selected-work__tab"
                type="button"
                role="tab"
                aria-selected={selectedProject.id === project.id}
                aria-controls={`selected-work-panel-${project.id}`}
                tabIndex={selectedProject.id === project.id ? 0 : -1}
                onClick={() => setSelectedId(project.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span className="selected-work__tab-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{project.name}</span>
                <span className="selected-work__tab-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
          <p className="selected-work__tab-note">
            Select a project to explore its screens.
          </p>
        </nav>

        <article
          className="selected-work__panel"
          id={`selected-work-panel-${selectedProject.id}`}
          role="tabpanel"
          aria-labelledby={`selected-work-tab-${selectedProject.id}`}
          tabIndex={0}
          key={selectedProject.id}
        >
          <div className="selected-work__hero">
            <div className="selected-work__project-copy">
              <p className="selected-work__project-label">
                {selectedProject.category}
              </p>
              <h3>{selectedProject.name}</h3>
              <p className="selected-work__description">
                {selectedProject.description}
              </p>
              <div className="selected-work__meta">
                <span>{selectedProject.year}</span>
                <span>{selectedProject.screens.length} screens</span>
              </div>
              {websiteUrl ? (
                <a
                  className="selected-work__website-link"
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit live website <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="selected-work__website-note">
                  Live website link can be added later
                </span>
              )}
            </div>

            <div className="selected-work__prototype">
              <div className="selected-work__prototype-heading">
                <span>Prototype preview</span>
                <span>FIGMA / INTERACTIVE</span>
              </div>
              {prototypeUrl ? (
                <iframe
                  className="selected-work__prototype-frame"
                  src={prototypeUrl}
                  title={`${selectedProject.name} Figma prototype`}
                  loading="lazy"
                  allow="fullscreen; clipboard-read; clipboard-write"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="selected-work__prototype-placeholder">
                  <span className="selected-work__prototype-icon" aria-hidden="true">
                    F
                  </span>
                  <span className="selected-work__prototype-title">
                    Figma prototype frame
                  </span>
                  <span className="selected-work__prototype-caption">
                    Add this project’s Figma embed URL to show an interactive
                    prototype here.
                  </span>
                </div>
              )}
            </div>
          </div>

          <section
            className="selected-work__screens"
            aria-labelledby={`selected-work-screens-${selectedProject.id}`}
          >
            <div className="selected-work__screens-heading">
              <div>
                <p className="selected-work__screens-label">Screens & details</p>
                <h4 id={`selected-work-screens-${selectedProject.id}`}>
                  Project visuals
                </h4>
              </div>
              <span>
                01 — {String(selectedProject.screens.length).padStart(2, "0")}
              </span>
            </div>
            <div className="selected-work__screen-grid">
              {selectedProject.screens.map((screen, index) => (
                <figure
                  className="selected-work__screen"
                  key={screen.src}
                  data-featured={index === 0 ? "" : undefined}
                >
                  <div className="selected-work__screen-image">
                    <img
                      src={screen.src}
                      alt={screen.alt}
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                  <figcaption>
                    <span>{screen.label}</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}
