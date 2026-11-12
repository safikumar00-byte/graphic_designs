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
