import { Package } from "lucide-react";
import { ComingSoonPage } from "@/components/utilities/coming-soon-page";

export default function LostFoundPage() {
  return (
    <ComingSoonPage
      eyebrow="Lost & Found"
      title="Lost & Found is paused until reporting works safely"
      description="This needs reliable item reporting, photo uploads, proof workflows, and moderation before students can depend on it for important belongings. We are holding it back until that experience is genuinely trustworthy."
      icon={Package}
      highlights={[
        "Item reporting and claim verification are not ready yet.",
        "Photo evidence and contact flow still need real backend support.",
        "We want recovery and proof handling to work safely before launch.",
      ]}
    />
  );
}
