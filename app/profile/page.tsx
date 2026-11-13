import type { Metadata } from "next";
import PortfolioProfile from "@/components/portfolio-profile";
import "./profile.css";

export const metadata: Metadata = {
  title: "Sunil Kumar Reddy | Designer & Developer",
  description:
    "Portfolio of Sunil Kumar Reddy, a multidisciplinary UI/UX designer, graphic designer, and application developer.",
};

export default function ProfilePage() {
  return <PortfolioProfile />;
}
