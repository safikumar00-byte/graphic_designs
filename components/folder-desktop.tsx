"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CardFlipDock from "@/components/mfa/CardFlipDock";
import type { GalleryCardData, GalleryImage } from "@/lib/gallery-data";

type ProjectFolder = {
  id: string;
  title: string;
  images: GalleryImage[];
};

type FolderPosition = { x: number; y: number };
type FolderDrag = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  moved: boolean;
};

function getProjectFolders(cards: GalleryCardData[]): ProjectFolder[] {
  const projects = new Map<string, ProjectFolder>();
  for (const card of cards) {
    const project = projects.get(card.title) ?? {
      id: card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: card.title,
      images: [],
    };
    project.images.push(...card.images);
    projects.set(card.title, project);
  }
  return [...projects.values()];
}

function getInitialPositions(count: number) {
  const columns = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(count * 1.5))));
  const positions: FolderPosition[] = [];
  for (let index = 0; index < count; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    positions.push({
      x: 0.07 + column * (0.82 / Math.max(1, columns - 1)),
      y: 0.18 + row * 0.22,
    });
  }
  return positions;
}

export function FolderDesktop({ cards }: { cards: GalleryCardData[] }) {
  const projects = useMemo(() => getProjectFolders(cards), [cards]);
  const folderAreaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<FolderDrag | null>(null);
  const draggedClickRef = useRef(false);
  const [positions, setPositions] = useState<FolderPosition[]>(() =>
    getInitialPositions(projects.length),
  );
  const [activeFolder, setActiveFolder] = useState<ProjectFolder | null>(null);

  const finishDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    draggedClickRef.current = drag.moved;
    dragRef.current = null;
    if (drag.moved) {
      window.setTimeout(() => {
        draggedClickRef.current = false;
      }, 0);
    }
  }, []);

  const moveFolder = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const folderArea = folderAreaRef.current;
    if (!drag || !folderArea || drag.pointerId !== event.pointerId) return;
    const bounds = folderArea.getBoundingClientRect();
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved && !event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    drag.moved = true;
    const widthRange = Math.max(1, bounds.width);
    const heightRange = Math.max(1, bounds.height);
    setPositions((current) =>
      current.map((position, index) =>
        projects[index].id === drag.id
          ? {
              x: Math.max(0.05, Math.min(0.95, (drag.startLeft * widthRange + dx) / widthRange)),
              y: Math.max(0, Math.min(0.82, (drag.startTop * heightRange + dy) / heightRange)),
            }
          : position,
      ),
    );
  };

  useEffect(() => {
    if (!activeFolder) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveFolder(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeFolder]);

  return (
    <main className="folder-desktop-shell">
      <div className="folder-window">
        <header className="folder-titlebar">
          <div className="folder-traffic-lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="folder-window-name">Portfolio</span>
          <a className="folder-gallery-link" href="/">
            Infinite gallery <span aria-hidden="true">↗</span>
          </a>
        </header>

        <section className="folder-desktop" aria-label="Project folders">
          <div className="folder-desktop-heading">
            <p>Selected projects</p>
            <span>Click to open · Drag to rearrange</span>
          </div>
          <div ref={folderAreaRef} className="folder-icons">
            {projects.map((project, index) => {
              const position = positions[index] ?? { x: 0.1, y: 0.2 };
              return (
                <button
                  type="button"
                  key={project.id}
                  className="project-folder"
                  style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    const bounds = folderAreaRef.current?.getBoundingClientRect();
                    if (!bounds) return;
                    dragRef.current = {
                      id: project.id,
                      pointerId: event.pointerId,
                      startX: event.clientX,
                      startY: event.clientY,
                      startLeft: position.x,
                      startTop: position.y,
                      moved: false,
                    };
                  }}
                  onPointerMove={moveFolder}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                  onClick={() => {
                    if (draggedClickRef.current) return;
                    setActiveFolder(project);
                  }}
                  aria-label={`Open ${project.title} folder, ${project.images.length} images`}
                >
                  <span className="folder-icon" aria-hidden="true">
                    <span className="folder-tab" />
                    <span className="folder-front">
                      {project.images[0] && <img src={project.images[0].src} alt="" />}
                    </span>
                  </span>
                  <span className="folder-label">{project.title}</span>
                  <span className="folder-count">{project.images.length} items</span>
                </button>
              );
            })}
          </div>
          <footer className="folder-desktop-footer">
            <span>{projects.length} folders</span>
            <span>WEBP · DESIGN ARCHIVE</span>
          </footer>
        </section>
      </div>

      {activeFolder && (
        <div
          className="project-folder-overlay"
          role="presentation"
          onClick={() => setActiveFolder(null)}
        >
          <section
            className="project-folder-window"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeFolder.title} project`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="project-folder-windowbar">
              <div className="folder-traffic-lights" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <h1>{activeFolder.title}</h1>
              <button type="button" onClick={() => setActiveFolder(null)} aria-label="Close folder">
                ×
              </button>
            </header>
            <CardFlipDock images={activeFolder.images} title={activeFolder.title} />
          </section>
        </div>
      )}
    </main>
  );
}
