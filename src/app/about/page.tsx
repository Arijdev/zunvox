import type { Metadata } from "next";
import Link from "next/link";
import AppInstallHub from "@/components/AppInstallHub";
import InformationPageLayout, {
  InformationSection,
} from "@/components/InformationPageLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About Zunvox",
  description:
    "Learn about Zunvox, a collection of free browser-based file utilities built around local processing, privacy, and straightforward workflows.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <InformationPageLayout
      title="About Zunvox"
      description="Everyday file tools, designed to work directly in your browser and keep your documents on your device."
    >
      <InformationSection title="A simpler way to work with files">
        <p>
          Zunvox brings file compression, conversion, organization, OCR, on-device
          AI, and file encryption together in one free utility suite. Choose a
          tool, process a file locally, and download the result.
        </p>
        <p>
          The goal is to make common file tasks quick and accessible without
          requiring an account or asking you to send your documents to a file
          processing server.
        </p>
      </InformationSection>

      <InformationSection title="Built for local processing">
        <p>
          File utilities run in your browser. AI and OCR features may download
          model weights or language data from their providers on first use; your
          documents and text are processed on your device and are not sent to
          those providers.
        </p>
        <p>
          Browser capabilities, available memory, and the format of a source
          document can affect results. Each tool page explains relevant format
          limitations before you use it.
        </p>
      </InformationSection>

      <InformationSection title="Get Zunvox on Your Devices">
        <AppInstallHub />
      </InformationSection>

      <InformationSection title="Explore the tools">
        <p>
          Visit the <Link className="font-semibold underline" href="/">Zunvox
          dashboard</Link> to browse all available utilities, or read our{" "}
          <Link className="font-semibold underline" href="/privacy">privacy
          details</Link>.
        </p>
      </InformationSection>
    </InformationPageLayout>
  );
}
