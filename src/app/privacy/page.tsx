import type { Metadata } from "next";
import InformationPageLayout, {
  InformationSection,
} from "@/components/InformationPageLayout";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy at Zunvox",
  description:
    "Read how Zunvox handles file processing, on-device AI model downloads, browser storage, and feedback.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <InformationPageLayout
      title="Privacy at Zunvox"
      description="Your files and text are processed locally by the tools you choose. Here is what that means in practice."
    >
      <InformationSection title="Your files are not uploaded">
        <p>
          Zunvox file utilities read and process selected files in your browser.
          Files, passwords, encryption keys, and processed results are not sent
          to Zunvox for file processing.
        </p>
        <p>
          The Zunvox Vault performs encryption and decryption with the browser
          Web Crypto API. Keep your passphrase safe: Zunvox cannot recover it.
        </p>
      </InformationSection>

      <InformationSection title="AI and OCR downloads">
        <p>
          On first use, AI tools may download model weights, and OCR may download
          its recognition code and language data. These downloads come from
          third-party asset hosts and may be cached by your browser. The
          documents and text you process are not sent to model providers.
        </p>
        <p>
          AI models and OCR run in your browser and use your device resources.
          Browser storage settings, memory limits, or network restrictions can
          affect availability.
        </p>
      </InformationSection>

      <InformationSection title="Browser storage and downloads">
        <p>
          Some tools or model libraries may use browser storage to cache assets.
          Processed files are offered as local downloads. Your browser may keep
          downloads, cached assets, or site data according to its own settings.
        </p>
      </InformationSection>

      <InformationSection title="Feedback">
        <p>
          Feedback entered on our feedback page is not transmitted or stored by
          Zunvox. The page lets you copy your message so you can choose how to
          share it.
        </p>
      </InformationSection>
    </InformationPageLayout>
  );
}
