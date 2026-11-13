import type { Metadata } from "next";
import CardNav from "@/components/card-nav";
import "./globals.css";


export const metadata: Metadata = {
  title: "Graphic Design Gallery",
  description: "Selected visual design work and animated project collections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CardNav
          logo={<span className="gallery-brand">GD <span>/ STUDIO</span></span>}
          logoAlt="Graphic Design Gallery home"
          maxWidth={800}
          cardHeight={170}
          theme="dark"
          surface="glass"
          openOn="click"
          cardEffect="rise"
          accentColor="#e5e5e5"
          items={[
            {
              label: "Gallery",
              description: "Browse the visual work and project collections.",
              links: [
                { label: "Interactive gallery", href: "/" },
                { label: "Folder view", href: "/desktop" },
                { label: "UI/UX case studies", href: "/case-study" },
              ],
            },
            {
              label: "UI/UX",
              description: "Explore application case studies and screen flows.",
              links: [
                { label: "Credbuddha", href: "/case-study/credbuddha" },
                { label: "CVM HRM", href: "/case-study/cvm-hrm" },
                { label: "TurboPaisa", href: "/case-study/turbopaisa" },
              ],
            },
            {
              label: "Profile",
              description: "Meet Sunil and explore his design, development, and product work.",
              links: [
                { label: "About Sunil", href: "/profile" },
                { label: "Selected work", href: "/profile#selected-work" },
                { label: "Contact", href: "/profile#contact" },
              ],
            },
            {
              label: "Workspace",
              description: "Switch between the interactive gallery and folder view.",
              links: [
                { label: "Interactive gallery", href: "/" },
                { label: "Folder view", href: "/desktop" },
              ],
            },
          ]}
        />
        {children}

      </body>
    </html>
  );
}
