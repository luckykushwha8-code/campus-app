import { Briefcase } from "lucide-react";
import { ComingSoonPage } from "@/components/utilities/coming-soon-page";

export default function PlacementsPage() {
  return (
    <ComingSoonPage
      eyebrow="Placements & Internships"
      title="Placements will launch when listings are verified"
      description="Jobs and internships need trusted sources, apply links, ownership rules, and cleaner moderation before students rely on them. We are keeping this page intentional instead of pretending the flow is already complete."
      icon={Briefcase}
      highlights={[
        "Recruiter and placement-cell verification still need to be implemented.",
        "Application tracking and source validation are not ready yet.",
        "We want this section to feel reliable before it becomes part of the core product.",
      ]}
    />
  );
}
