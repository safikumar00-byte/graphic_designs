import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplicationCaseStudyGallery from "@/components/application-case-study-gallery";
import { applicationCaseStudies } from "@/lib/application-case-study-data";
import "./case-study.css";

type RouteProps = {
  params: Promise<{ project: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return applicationCaseStudies.map(({ slug }) => ({ project: slug }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { project } = await params;
  const application = applicationCaseStudies.find(({ slug }) => slug === project);

  return {
    title: application
      ? `${application.name} Case Study | Graphic Design Gallery`
      : "Application Case Study | Graphic Design Gallery",
  };
}

export default async function ApplicationCaseStudyPage({ params }: RouteProps) {
  const { project } = await params;
  const application = applicationCaseStudies.find(({ slug }) => slug === project);
  if (!application) notFound();

  return <ApplicationCaseStudyGallery selectedProject={application} />;
}
