import { BookOpen } from "lucide-react";
import { ComingSoonPage } from "@/components/utilities/coming-soon-page";

export default function NotesPage() {
  return (
    <ComingSoonPage
      eyebrow="Class Notes"
      title="Notes is being prepared for real student use"
      description="We are holding this feature back until uploads, search, ownership, and moderation work end to end. That way students do not land on a page that looks finished but behaves like a demo."
      icon={BookOpen}
      highlights={[
        "Real note uploads and file storage are not finished yet.",
        "Subject filters, downloads, and ownership need proper backend support.",
        "This page will return once sharing and discovery work reliably for real users.",
      ]}
    />
  );
}
