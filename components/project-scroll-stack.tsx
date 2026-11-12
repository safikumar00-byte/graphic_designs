"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

type Project = {
  name: string;
  category: string;
  year: string;
  description: string;
  accent: string;
  images: { src: string; alt: string }[];
};

const projects: Project[] = [
  {
    name: "Tristone Creations",
    category: "Brand campaign · Social",
    year: "2026",
    description: "A brighter, more cohesive social identity built to make every campaign feel unmistakably Tristone.",
    accent: "#d8ff47",
    images: [
      { src: "/tristoneCarouselBanners/webp/tristone_creations_1.webp", alt: "Tristone Creations brand campaign" },
      { src: "/tristoneCarouselBanners/webp/tristone_creations_2.webp", alt: "Tristone Creations campaign artwork" },
      { src: "/tristoneCarouselBanners/webp/tristone_creations_3.webp", alt: "Tristone Creations social design" },
    ],
  },
  {
    name: "Student Care",
    category: "Education · Campaign system",
    year: "2026",
    description: "Clear, confident study-abroad campaigns that turn complex options into an inviting next step.",
    accent: "#3b83dc",
    images: [
      { src: "/studentCare/webp/studnet_care_1.webp", alt: "Student Care UK study campaign" },
      { src: "/studentCare/webp/studnet_care_2.webp", alt: "Student Care education campaign" },
      { src: "/studentCare/webp/studnet_care_3.webp", alt: "Student Care admissions campaign" },
    ],
  },
  {
    name: "Travellers Bridge",
    category: "Travel · Destination campaign",
    year: "2026",
    description: "Destination-led visuals for a travel brand, pairing vivid places with a simple, bookable story.",
    accent: "#59bfd1",
    images: [
      { src: "/travellersBridge/webp/travellers_bridge_1.webp", alt: "Travellers Bridge Singapore destination campaign" },
      { src: "/travellersBridge/webp/travellers_bridge_2.webp", alt: "Travellers Bridge travel campaign" },
      { src: "/travellersBridge/webp/travellers_bridge_3.webp", alt: "Travellers Bridge destination artwork" },
    ],
  },
];

export function ProjectScrollStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const stickyTop = Math.max(100, Math.min(148, window.innerHeight * 0.16));
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const nextCard = cardRefs.current[index + 1];
        if (!nextCard) {
          card.style.setProperty("--stack-progress", "0");
          return;
        }
        const nextTop = nextCard.getBoundingClientRect().top;
        const cardHeight = card.getBoundingClientRect().height;
        const progress = Math.min(1, Math.max(0, (stickyTop + cardHeight - nextTop) / cardHeight));
        card.style.setProperty("--stack-progress", `${progress}`);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section className="project-stack-section" ref={sectionRef} aria-labelledby="project-stack-title">
      <div className="project-stack-intro">
        <p className="project-stack-eyebrow">A few things we made</p>
        <h2 id="project-stack-title">Selected projects<span>.</span></h2>
        <p className="project-stack-note">Campaigns and identities, made to move people.</p>
      </div>

      <div className="project-stack" aria-label="Featured project case studies">
        {projects.map((project, index) => (
          <div className="project-stack-scene" key={project.name}>
            <article
              ref={(element) => { cardRefs.current[index] = element; }}
              className="project-case-card"
              style={{ "--project-accent": project.accent, "--stack-index": index } as React.CSSProperties}
            >
              <div className="project-case-copy">
                <p className="project-case-kicker">{project.name} · Case study</p>
                <h3>{project.name}</h3>
                <p className="project-case-description">{project.description}</p>
                <div className="project-case-meta">
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                </div>
                <a className="project-case-link" href={project.images[0].src} target="_blank" rel="noreferrer">
                  View artwork <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
                </a>
              </div>

              <div className="project-browser" aria-label={`${project.name} project preview`}>
                <div className="project-browser-bar">
                  <span className="project-browser-dots" aria-hidden="true"><i /><i /><i /></span>
                  <span className="project-browser-address">studio.project / {project.name.toLowerCase().replaceAll(" ", "-")}</span>
                </div>
                <div className="project-browser-content">
                  <div className="project-browser-rail" aria-hidden="true">
                    <span className="project-browser-mark" style={{ backgroundColor: project.accent }} />
                    <span className="project-browser-rail-line is-active" />
                    <span className="project-browser-rail-line" />
                    <span className="project-browser-rail-line" />
                    <span className="project-browser-rail-line" />
                  </div>
                  <div className="project-browser-work">
                    <div className="project-browser-heading">
                      <span>{project.name}</span>
                      <span>01 / 03</span>
                    </div>
                    <div className="project-browser-feature">
                      <img src={project.images[0].src} alt={project.images[0].alt} />
                    </div>
                    <div className="project-browser-thumbnails">
                      {project.images.slice(1).map((image) => (
                        <div className="project-browser-thumbnail" key={image.src}>
                          <img src={image.src} alt={image.alt} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <span className="project-case-index" aria-hidden="true">0{index + 1}</span>
            </article>
          </div>
        ))}
      </div>

      <p className="project-stack-outro">More work lives in the gallery above.</p>
    </section>
  );
}