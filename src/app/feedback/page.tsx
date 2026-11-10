import type { Metadata } from "next";
import FeedbackForm from "@/components/FeedbackForm";
import InformationPageLayout, {
  InformationSection,
} from "@/components/InformationPageLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Feedback | Zunvox",
  description:
    "Share a suggestion, bug report, or other feedback about Zunvox. Your message stays in your browser until you choose to copy it.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return (
    <InformationPageLayout
      title="Share feedback"
      description="Suggestions and bug reports help us make Zunvox more useful. Write a message below and copy it to share through a channel you choose."
    >
      <FeedbackForm />
      <InformationSection title="Your feedback stays with you">
        <p>
          This form does not submit or store your message. After copying it, you
          can paste it into your preferred email or feedback channel. Do not
          include passwords, private documents, or other sensitive information.
        </p>
      </InformationSection>
    </InformationPageLayout>
  );
}
