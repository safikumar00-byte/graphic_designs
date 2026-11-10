import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
