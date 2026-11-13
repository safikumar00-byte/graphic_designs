import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Application Case Studies | Graphic Design Gallery",
  description: "Browse image-led case studies for three application experiences.",
};

export default function CaseStudiesIndexPage() {
  redirect("/case-study/credbuddha");
}
