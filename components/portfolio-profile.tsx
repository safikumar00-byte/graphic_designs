import Image from "next/image";
import Link from "next/link";
import SpotlightCard from "@/components/react-bits/spotlight-card";

const featuredWork = [
  {
    number: "01",
    title: "Core Volt Matrix",
    category: "Enterprise HRMS · Product design",
    description:
      "Employee, onboarding, attendance, and leave workflows for a role-based HR platform.",
    image: "/case-study/screens/cvm-dashboard.webp",
    imageAlt: "Core Volt Matrix HRMS employee dashboard",
    width: 1440,
    height: 1024,
    href: "/case-study/cvm-hrm",
    action: "Explore application screens",
    className: "profile-work-card--wide",
  },
  {
    number: "02",
    title: "Fintech product experiences",
    category: "Fintech · UI/UX",
    description:
      "Loan discovery, application, and rewards journeys across CredBuddha and TurboPaisa.",
    image: "/case-study/screens/credbuddha-home.webp",
    imageAlt: "Credbuddha mobile application home screen",
    width: 376,
    height: 812,
    href: "/case-study/credbuddha",
    action: "View fintech case study",
    className: "profile-work-card--mobile",
  },
  {
    number: "03",
    title: "Brand & campaign systems",
    category: "Visual communication · Campaigns",
    description:
      "Visual storytelling and social campaign artwork for education, travel, and consumer brands.",
    image: "/tristoneCarouselBanners/webp/tristone_creations_1.webp",
    imageAlt: "Tristone Creations social campaign artwork",
    width: 1080,
    height: 1440,
    href: "/",
    action: "Browse visual work",
    className: "profile-work-card--campaign",
  },
];

const expertise = [
  {
    number: "01",
    title: "Product & UX",
    skills: [
      "UX strategy",
      "User research",
      "Wireframing",
      "Prototyping",
      "Interaction design",
      "Design systems",
      "Accessibility",
    ],
  },
  {
    number: "02",
    title: "Visual design",
    skills: [
      "Brand identity",
      "Art direction",
      "Campaign design",
      "Typography",
      "Motion graphics",
      "Social content",
    ],
  },
  {
    number: "03",
    title: "Build & prototype",
    skills: [
      "React",
      "Next.js",
      "React Native",
      "TypeScript",
      "Tailwind CSS",
      "GSAP",
      "REST APIs",
    ],
  },
];

const experience = [
  {
    period: "Dec 2025 — Present",
    role: "Graphic Designer",
    company: "TekWissen Software Pvt. Ltd.",
    detail:
      "Digital campaigns, visual communication, presentation systems, and motion-led content.",
  },
  {
    period: "Jun 2023 — Apr 2025",
    role: "UI/UX Designer & Developer",
    company: "Intexm Media Private Limited",
    detail:
      "Fintech product design, conversion-focused web experiences, and responsive React interfaces.",
  },
  {
    period: "Jan 2020 — Jun 2023 · Part-time",
    role: "Hospital Administration Assistant",
    company: "Sagara Durga Hospital",
    detail:
      "Hands-on experience with patient documentation, insurance, billing, and accounts workflows.",
  },
];

const certifications = [
  "Visual Communication Design for Digital Media · IIT Roorkee",
  "Introduction to Interaction Design · IIT Roorkee",
  "Design & Implementation of Human-Computer Interfaces · IIT Guwahati",
  "JavaScript Algorithms and Data Structures · freeCodeCamp",
  "Responsive Web Design · freeCodeCamp",
];

export default function PortfolioProfile() {
  return (
    <main className="portfolio-profile">
      <section className="profile-hero" aria-labelledby="profile-title">
        <div className="profile-hero__copy">
          <p className="profile-eyebrow">
            <span className="profile-eyebrow__dot" />
            UI/UX · Graphic design · Application development
          </p>
          <h1 id="profile-title">
            Sunil Kumar
            <br />
            <span>Reddy.</span>
          </h1>
          <p className="profile-hero__statement">
            I bring product thinking, visual craft, and front-end development
            together to make useful digital experiences.
          </p>
          <p className="profile-hero__location">Based in Visakhapatnam, India</p>
          <div className="profile-hero__actions">
            <a className="profile-button profile-button--dark" href="#selected-work">
              Explore selected work <span aria-hidden="true">↓</span>
            </a>
            <a className="profile-button profile-button--text" href="#contact">
              Let&apos;s talk <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="profile-hero__facts" aria-label="Career highlights">
            <div>
              <strong>3+</strong>
              <span>years in design & technology</span>
            </div>
            <div>
              <strong>10+</strong>
              <span>web & mobile projects</span>
            </div>
            <div>
              <strong>40+</strong>
              <span>mobile screens in 4 weeks</span>
            </div>
          </div>
        </div>

        <div className="profile-hero__visual" aria-label="Selected design work">
          <div className="profile-hero__visual-label">
            <span>Independent by nature</span>
            <span>01 — 03</span>
          </div>
          <SpotlightCard
            className="profile-hero__artwork"
            intensity={0.12}
            spotlightColor="#c1f184"
            spotlightSize={330}
          >
            <Image
              src="/tristoneCarouselBanners/webp/tristone_creations_1.webp"
              alt="A vivid Tristone Creations brand campaign artwork"
              fill
              priority
              sizes="(max-width: 760px) 90vw, 42vw"
              style={{ objectFit: "cover" }}
            />
          </SpotlightCard>
          <div className="profile-hero__signature">
            <span>SKR</span>
            <span>Design with intent. Build with care.</span>
          </div>
          <div className="profile-hero__orbit" aria-hidden="true">
            <span>UX</span>
            <span>UI</span>
            <span>DEV</span>
          </div>
        </div>
      </section>

      <section
        className="profile-work section-reveal"
        id="selected-work"
        aria-labelledby="profile-work-title"
      >
        <div className="profile-section-heading">
          <div>
            <p className="profile-eyebrow">A few things I&apos;ve worked on</p>
            <h2 id="profile-work-title">Selected work<span>.</span></h2>
          </div>
          <Link href="/" className="profile-inline-link">
            Explore the full gallery <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="profile-work-grid">
          {featuredWork.map((project) => (
            <article
              className={`profile-work-card ${project.className}`}
              key={project.number}
            >
              <Link
                className="profile-work-card__image-link"
                href={project.href}
                aria-label={`${project.action}: ${project.title}`}
              >
                <SpotlightCard
                  className="profile-work-card__image"
                  intensity={0.11}
                  spotlightColor="#b5c29e"
                  spotlightSize={270}
                >
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    fill
                    sizes={
                      project.className === "profile-work-card--wide"
                        ? "(max-width: 760px) 92vw, 58vw"
                        : "(max-width: 760px) 92vw, 30vw"
                    }
                    style={{ objectFit: "contain" }}
                  />
                </SpotlightCard>
              </Link>
              <div className="profile-work-card__copy">
                <div>
                  <span>{project.number} / {project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <Link href={project.href} aria-label={`${project.action}: ${project.title}`}>
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="profile-additional-work">
          <p>Additional product work</p>
          <ul>
            <li>
              <span>Karyotica Labs</span>
              Brand experience & website revamp · Next.js
            </li>
            <li>
              <span>Visionicx</span>
              Enterprise mobile application · 40+ screens in four weeks
            </li>
            <li>
              <span>Cross-device trade signals</span>
              Product concept · Firebase & Supabase integrations
            </li>
          </ul>
        </div>
      </section>

      <section className="profile-expertise section-reveal" aria-labelledby="profile-expertise-title">
        <div className="profile-section-heading">
          <div>
            <p className="profile-eyebrow">How I make things</p>
            <h2 id="profile-expertise-title">A useful mix of skills<span>.</span></h2>
          </div>
          <p className="profile-section-note">
            From the first sketch to a working interface, I enjoy carrying an
            idea across disciplines.
          </p>
        </div>
        <div className="profile-expertise-grid">
          {expertise.map((area) => (
            <SpotlightCard
              className="profile-expertise-card"
              key={area.number}
              spotlightColor="#c1f184"
              spotlightSize={240}
            >
              <div className="profile-expertise-card__top">
                <span>{area.number}</span>
                <span aria-hidden="true">✳</span>
              </div>
              <h3>{area.title}</h3>
              <ul>
                {area.skills.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            </SpotlightCard>
          ))}
        </div>
        <p className="profile-tools-line">
          <span>Tools & workflows</span>
          Figma · FigJam · Adobe Creative Cloud · Framer · ProtoPie · React ·
          Next.js · GitHub Copilot · AI-assisted design
        </p>
      </section>

      <section className="profile-experience section-reveal" aria-labelledby="profile-experience-title">
        <div className="profile-section-heading">
          <div>
            <p className="profile-eyebrow">The path so far</p>
            <h2 id="profile-experience-title">Experience<span>.</span></h2>
          </div>
        </div>
        <ol className="profile-timeline">
          {experience.map((item, index) => (
            <li className="profile-timeline__item" key={item.company}>
              <span className="profile-timeline__index">
                0{index + 1}
              </span>
              <div>
                <span className="profile-timeline__period">{item.period}</span>
                <h3>{item.role}</h3>
                <p className="profile-timeline__company">{item.company}</p>
              </div>
              <p className="profile-timeline__detail">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="profile-education section-reveal" aria-labelledby="profile-education-title">
        <div className="profile-section-heading">
          <div>
            <p className="profile-eyebrow">Foundations & continued learning</p>
            <h2 id="profile-education-title">Learning, always<span>.</span></h2>
          </div>
        </div>
        <div className="profile-learning-grid">
          <article className="profile-education-card">
            <span>2020 — 2023</span>
            <h3>Bachelor of Technology</h3>
            <p>Electrical & Electronics Engineering</p>
            <p>Sanketika Institute of Technology and Management · Visakhapatnam</p>
          </article>
          <details className="profile-certifications">
            <summary>
              <span>Selected certifications</span>
              <span aria-hidden="true">＋</span>
            </summary>
            <ul>
              {certifications.map((certification) => (
                <li key={certification}>{certification}</li>
              ))}
            </ul>
          </details>
        </div>
        <p className="profile-languages">
          <span>Languages</span> English · Telugu · Hindi
        </p>
      </section>

      <footer className="profile-contact" id="contact">
        <p className="profile-eyebrow">Have a thoughtful challenge?</p>
        <h2>Let&apos;s make something meaningful.</h2>
        <div className="profile-contact__links">
          <a href="mailto:vsunilkumarvzg@gmail.com">vsunilkumarvzg@gmail.com</a>
          <a href="tel:+918790549591">+91 87905 49591</a>
          <a href="https://www.linkedin.com/in/sunilkumarvzg" target="_blank" rel="noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a href="https://www.behance.net/8fc59bee" target="_blank" rel="noreferrer">
            Behance <span aria-hidden="true">↗</span>
          </a>
          <a href="/resume/Sunil_Kumar_Reddy.pdf" download>
            Download resume <span aria-hidden="true">↓</span>
          </a>
        </div>
        <p className="profile-contact__footer">Sunil Kumar Reddy · Visakhapatnam, India</p>
      </footer>
    </main>
  );
}
